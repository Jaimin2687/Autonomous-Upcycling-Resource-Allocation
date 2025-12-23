module aura::escrow_settlement {
    use aptos_std::simple_map;
    use aptos_std::simple_map::SimpleMap;
    use std::signer;

    use aura::roles;

    const ERR_ALREADY_INITIALIZED: u64 = 1;
    const ERR_NOT_AUTHORIZED: u64 = 2;
    const ERR_NOT_FOUND: u64 = 3;
    const ERR_INVALID_STATUS: u64 = 4;
    const ERR_INVALID_SIGNER: u64 = 5;
    const ERR_ALREADY_SIGNED: u64 = 6;
    const ERR_NOT_SIGNED: u64 = 7;
    const ERR_NO_SHARE: u64 = 8;
    const ERR_AMOUNT_MISMATCH: u64 = 9;

    const STATUS_CREATED: u8 = 0;
    const STATUS_FUNDED: u8 = 1;
    const STATUS_FINALIZED: u8 = 2;
    const STATUS_COMPLETED: u8 = 3;

    struct EscrowRecord has drop, store {
        id: u64,
        lot_id: u64,
        producer: address,
        recycler: address,
        agent: address,
        total_amount: u64,
        status: u8,
        producer_signed: bool,
        recycler_signed: bool,
        agent_signed: bool,
        funded_amount: u64,
        producer_share: u64,
        agent_share: u64,
        treasury_share: u64,
        producer_withdrawn: bool,
        agent_withdrawn: bool,
        treasury_withdrawn: bool,
        memo: vector<u8>,
    }

    struct Registry has key {
        next_id: u64,
        records: SimpleMap<u64, EscrowRecord>,
    }

    public entry fun init(admin: &signer) {
        assert!(!exists<Registry>(@aura), ERR_ALREADY_INITIALIZED);
        assert!(signer::address_of(admin) == roles::admin_address(), ERR_NOT_AUTHORIZED);
        move_to(admin, Registry {
            next_id: 1,
            records: simple_map::create<u64, EscrowRecord>(),
        });
    }

    public entry fun open(
        agent: &signer,
        lot_id: u64,
        producer: address,
        recycler: address,
        total_amount: u64,
        memo: vector<u8>,
    ) acquires Registry {
        roles::assert_marketplace(signer::address_of(agent));
        let registry = borrow_global_mut<Registry>(@aura);
        let escrow_id = registry.next_id;
        registry.next_id = escrow_id + 1;
        let record = EscrowRecord {
            id: escrow_id,
            lot_id,
            producer,
            recycler,
            agent: signer::address_of(agent),
            total_amount,
            status: STATUS_CREATED,
            producer_signed: false,
            recycler_signed: false,
            agent_signed: true,
            funded_amount: 0,
            producer_share: 0,
            agent_share: 0,
            treasury_share: 0,
            producer_withdrawn: false,
            agent_withdrawn: false,
            treasury_withdrawn: false,
            memo,
        };
        simple_map::upsert(&mut registry.records, escrow_id, record);
    }

    public entry fun sign_producer(producer: &signer, escrow_id: u64) acquires Registry {
        let registry = borrow_global_mut<Registry>(@aura);
        assert!(simple_map::contains_key(&registry.records, &escrow_id), ERR_NOT_FOUND);
        let record = simple_map::borrow_mut(&mut registry.records, &escrow_id);
        assert!(record.status == STATUS_CREATED || record.status == STATUS_FUNDED, ERR_INVALID_STATUS);
        assert!(record.producer == signer::address_of(producer), ERR_INVALID_SIGNER);
        assert!(!record.producer_signed, ERR_ALREADY_SIGNED);
        record.producer_signed = true;
    }

    public entry fun sign_recycler(recycler: &signer, escrow_id: u64) acquires Registry {
        let registry = borrow_global_mut<Registry>(@aura);
        assert!(simple_map::contains_key(&registry.records, &escrow_id), ERR_NOT_FOUND);
        let record = simple_map::borrow_mut(&mut registry.records, &escrow_id);
        assert!(record.status == STATUS_CREATED || record.status == STATUS_FUNDED, ERR_INVALID_STATUS);
        assert!(record.recycler == signer::address_of(recycler), ERR_INVALID_SIGNER);
        assert!(!record.recycler_signed, ERR_ALREADY_SIGNED);
        record.recycler_signed = true;
    }

    public entry fun fund(recycler: &signer, escrow_id: u64, amount: u64) acquires Registry {
        let registry = borrow_global_mut<Registry>(@aura);
        assert!(simple_map::contains_key(&registry.records, &escrow_id), ERR_NOT_FOUND);
        let record = simple_map::borrow_mut(&mut registry.records, &escrow_id);
        assert!(record.recycler == signer::address_of(recycler), ERR_INVALID_SIGNER);
        assert!(record.status == STATUS_CREATED, ERR_INVALID_STATUS);
        assert!(amount == record.total_amount, ERR_AMOUNT_MISMATCH);
        record.funded_amount = amount;
        record.status = STATUS_FUNDED;
    }

    public entry fun finalize(compliance: &signer, escrow_id: u64) acquires Registry {
        roles::assert_compliance(signer::address_of(compliance));
        let registry = borrow_global_mut<Registry>(@aura);
        assert!(simple_map::contains_key(&registry.records, &escrow_id), ERR_NOT_FOUND);
        let record = simple_map::borrow_mut(&mut registry.records, &escrow_id);
        assert!(record.status == STATUS_FUNDED, ERR_INVALID_STATUS);
        assert!(record.producer_signed && record.recycler_signed && record.agent_signed, ERR_NOT_SIGNED);
        let total = record.total_amount;
        let agent_fee = (total * (roles::agent_fee_bps() as u64)) / 10_000;
        let treasury_fee = (total * (roles::treasury_fee_bps() as u64)) / 10_000;
        let producer_amount = total - agent_fee - treasury_fee;
        record.producer_share = producer_amount;
        record.agent_share = agent_fee;
        record.treasury_share = treasury_fee;
        record.status = STATUS_FINALIZED;
    }

    public entry fun mark_withdrawn(participant: &signer, escrow_id: u64) acquires Registry {
        let participant_addr = signer::address_of(participant);
        let registry = borrow_global_mut<Registry>(@aura);
        assert!(simple_map::contains_key(&registry.records, &escrow_id), ERR_NOT_FOUND);
        let record = simple_map::borrow_mut(&mut registry.records, &escrow_id);
        assert!(record.status == STATUS_FINALIZED || record.status == STATUS_COMPLETED, ERR_INVALID_STATUS);
        if (participant_addr == record.producer) {
            assert!(record.producer_share > 0, ERR_NO_SHARE);
            assert!(!record.producer_withdrawn, ERR_NO_SHARE);
            record.producer_withdrawn = true;
        } else if (participant_addr == record.agent) {
            assert!(record.agent_share > 0, ERR_NO_SHARE);
            assert!(!record.agent_withdrawn, ERR_NO_SHARE);
            record.agent_withdrawn = true;
        } else if (participant_addr == roles::treasury_address()) {
            assert!(record.treasury_share > 0, ERR_NO_SHARE);
            assert!(!record.treasury_withdrawn, ERR_NO_SHARE);
            record.treasury_withdrawn = true;
        } else {
            abort ERR_INVALID_SIGNER
        };
        if (record.producer_withdrawn && record.agent_withdrawn && record.treasury_withdrawn) {
            record.status = STATUS_COMPLETED;
        }
    }

    public fun escrow_status(escrow_id: u64): u8 acquires Registry {
        let registry = borrow_global<Registry>(@aura);
        assert!(simple_map::contains_key(&registry.records, &escrow_id), ERR_NOT_FOUND);
        simple_map::borrow(&registry.records, &escrow_id).status
    }

    public fun outstanding_share(escrow_id: u64, participant: address): u64 acquires Registry {
        let registry = borrow_global<Registry>(@aura);
        assert!(simple_map::contains_key(&registry.records, &escrow_id), ERR_NOT_FOUND);
        let record = simple_map::borrow(&registry.records, &escrow_id);
        if (participant == record.producer) {
            if (record.producer_withdrawn) { 0 } else { record.producer_share }
        } else if (participant == record.agent) {
            if (record.agent_withdrawn) { 0 } else { record.agent_share }
        } else if (participant == roles::treasury_address()) {
            if (record.treasury_withdrawn) { 0 } else { record.treasury_share }
        } else {
            0
        }
    }

}
