module aura::roles {
    use aptos_std::simple_map;
    use aptos_std::simple_map::SimpleMap;
    use std::signer;

    friend aura::waste_lot;
    friend aura::certification;
    friend aura::escrow_settlement;
    friend aura::oracle_interface;

    const ERR_ALREADY_INITIALIZED: u64 = 1;
    const ERR_NOT_ADMIN: u64 = 2;
    const ERR_ROLE_MISSING: u64 = 3;
    const ERR_UNKNOWN_ROLE: u64 = 4;

    const ROLE_PRODUCER: u8 = 1;
    const ROLE_MARKETPLACE: u8 = 2;
    const ROLE_COMPLIANCE: u8 = 3;
    const ROLE_ORACLE: u8 = 4;

    const MAX_FEE_BPS: u16 = 10_000;

    struct Config has key {
        admin: address,
        treasury: address,
        agent_fee_bps: u16,
        treasury_fee_bps: u16,
        producers: SimpleMap<address, bool>,
        marketplaces: SimpleMap<address, bool>,
        compliance: SimpleMap<address, bool>,
        oracles: SimpleMap<address, bool>,
    }

    public entry fun init(admin: &signer, treasury: address, agent_fee_bps: u16, treasury_fee_bps: u16) {
        assert!(!exists<Config>(@aura), ERR_ALREADY_INITIALIZED);
        let admin_addr = signer::address_of(admin);
        assert!(admin_addr == @aura, ERR_NOT_ADMIN);
        assert!(agent_fee_bps <= MAX_FEE_BPS, ERR_UNKNOWN_ROLE);
        assert!(treasury_fee_bps <= MAX_FEE_BPS, ERR_UNKNOWN_ROLE);

        move_to(admin, Config {
            admin: admin_addr,
            treasury,
            agent_fee_bps,
            treasury_fee_bps,
            producers: simple_map::create<address, bool>(),
            marketplaces: simple_map::create<address, bool>(),
            compliance: simple_map::create<address, bool>(),
            oracles: simple_map::create<address, bool>(),
        });
    }

    public entry fun set_fees(admin: &signer, agent_fee_bps: u16, treasury_fee_bps: u16) acquires Config {
        let config = borrow_global_mut<Config>(@aura);
        assert!(config.admin == signer::address_of(admin), ERR_NOT_ADMIN);
        assert!(agent_fee_bps <= MAX_FEE_BPS, ERR_UNKNOWN_ROLE);
        assert!(treasury_fee_bps <= MAX_FEE_BPS, ERR_UNKNOWN_ROLE);
        config.agent_fee_bps = agent_fee_bps;
        config.treasury_fee_bps = treasury_fee_bps;
    }

    public entry fun grant_producer(admin: &signer, account_addr: address) acquires Config {
        modify_role(admin, ROLE_PRODUCER, account_addr, true);
    }

    public entry fun revoke_producer(admin: &signer, account_addr: address) acquires Config {
        modify_role(admin, ROLE_PRODUCER, account_addr, false);
    }

    public entry fun grant_marketplace(admin: &signer, account_addr: address) acquires Config {
        modify_role(admin, ROLE_MARKETPLACE, account_addr, true);
    }

    public entry fun revoke_marketplace(admin: &signer, account_addr: address) acquires Config {
        modify_role(admin, ROLE_MARKETPLACE, account_addr, false);
    }

    public entry fun grant_compliance(admin: &signer, account_addr: address) acquires Config {
        modify_role(admin, ROLE_COMPLIANCE, account_addr, true);
    }

    public entry fun revoke_compliance(admin: &signer, account_addr: address) acquires Config {
        modify_role(admin, ROLE_COMPLIANCE, account_addr, false);
    }

    public entry fun grant_oracle(admin: &signer, account_addr: address) acquires Config {
        modify_role(admin, ROLE_ORACLE, account_addr, true);
    }

    public entry fun revoke_oracle(admin: &signer, account_addr: address) acquires Config {
        modify_role(admin, ROLE_ORACLE, account_addr, false);
    }

    public fun is_producer(account_addr: address): bool acquires Config {
        simple_map::contains_key(&borrow_global<Config>(@aura).producers, &account_addr)
    }

    public fun is_marketplace(account_addr: address): bool acquires Config {
        simple_map::contains_key(&borrow_global<Config>(@aura).marketplaces, &account_addr)
    }

    public fun is_compliance(account_addr: address): bool acquires Config {
        simple_map::contains_key(&borrow_global<Config>(@aura).compliance, &account_addr)
    }

    public fun is_oracle(account_addr: address): bool acquires Config {
        simple_map::contains_key(&borrow_global<Config>(@aura).oracles, &account_addr)
    }

    public fun agent_fee_bps(): u16 acquires Config {
        borrow_global<Config>(@aura).agent_fee_bps
    }

    public fun treasury_fee_bps(): u16 acquires Config {
        borrow_global<Config>(@aura).treasury_fee_bps
    }

    public fun treasury_address(): address acquires Config {
        borrow_global<Config>(@aura).treasury
    }

    public fun admin_address(): address acquires Config {
        borrow_global<Config>(@aura).admin
    }

    public fun assert_producer(account_addr: address) acquires Config {
        assert!(is_producer(account_addr), ERR_ROLE_MISSING);
    }

    public fun assert_marketplace(account_addr: address) acquires Config {
        assert!(is_marketplace(account_addr), ERR_ROLE_MISSING);
    }

    public fun assert_compliance(account_addr: address) acquires Config {
        assert!(is_compliance(account_addr), ERR_ROLE_MISSING);
    }

    public fun assert_oracle(account_addr: address) acquires Config {
        assert!(is_oracle(account_addr), ERR_ROLE_MISSING);
    }

    fun modify_role(admin: &signer, role: u8, account_addr: address, add: bool) acquires Config {
        let config = borrow_global_mut<Config>(@aura);
        assert!(config.admin == signer::address_of(admin), ERR_NOT_ADMIN);
        if (role == ROLE_PRODUCER) {
            update_role_map(&mut config.producers, account_addr, add);
        } else if (role == ROLE_MARKETPLACE) {
            update_role_map(&mut config.marketplaces, account_addr, add);
        } else if (role == ROLE_COMPLIANCE) {
            update_role_map(&mut config.compliance, account_addr, add);
        } else if (role == ROLE_ORACLE) {
            update_role_map(&mut config.oracles, account_addr, add);
        } else {
            abort ERR_UNKNOWN_ROLE
        };
    }

    fun update_role_map(map_ref: &mut SimpleMap<address, bool>, account_addr: address, add: bool) {
        if (add) {
            simple_map::upsert(map_ref, account_addr, true);
        } else {
            assert!(simple_map::contains_key(map_ref, &account_addr), ERR_ROLE_MISSING);
            simple_map::remove(map_ref, &account_addr);
        }
    }
}
