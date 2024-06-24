"use client";

import { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const containerStyle = {
  width: '100%',
  height: '400px'
};

export interface MapLocationProps {
  address: string;
  latitude: number;
  longitude: number;
}

export function MapLocationLoading(): JSX.Element {
  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-[20px] w-[200px]" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}

export function MapLocation(props: MapLocationProps): JSX.Element {
  const [map, setMap] = useState(null);
  const center = {
    lat: props.latitude,
    lng: props.longitude
  };

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>{props.address}</CardTitle>
      </CardHeader>
      <CardContent>
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            onLoad={map => setMap(map as any)}
          >
            <Marker position={center} />
          </GoogleMap>
        </LoadScript>
      </CardContent>
    </Card>
  );
}