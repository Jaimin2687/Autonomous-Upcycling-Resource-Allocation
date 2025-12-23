"use client";

import dynamic from "next/dynamic";
import type { PropsWithChildren } from "react";

const ReactMap = dynamic(() => import("react-map-gl"), { ssr: false });

export default function LogisticsMap({ children }: PropsWithChildren) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl border border-slate-200">
      <ReactMap
        initialViewState={{ longitude: -98.5795, latitude: 39.8283, zoom: 3.5 }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        {children}
      </ReactMap>
    </div>
  );
}
