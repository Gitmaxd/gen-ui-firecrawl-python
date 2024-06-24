"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer, Libraries } from '@react-google-maps/api';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const containerStyle = {
  width: '100%',
  height: '400px'
};

const libraries: Libraries = ['places'];

export interface DirectionsProps {
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  steps: Array<{ instruction: string; distance: string }>;
  polyline: string;
}

export function DirectionsLoading(): JSX.Element {
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

export function Directions({ origin, destination, distance, duration, steps, polyline }: DirectionsProps): JSX.Element {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries,
  });

  const directionsCallback = useCallback((
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    console.log("DirectionsCallback called with status:", status);
    if (result !== null && status === 'OK') {
      setDirections(result);
      setRequestSent(true);
    } else {
      console.error("Directions request failed. Status:", status);
      setRequestSent(true);
    }
  }, []);

  useEffect(() => {
    // Reset requestSent when origin or destination changes
    setRequestSent(false);
    setDirections(null);
  }, [origin, destination]);

  if (loadError) {
    return <div>Map cannot be loaded right now, sorry.</div>
  }

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Directions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat: 0, lng: 0 }}
            zoom={2}
          >
            {!requestSent && (
              <DirectionsService
                options={{
                  destination: destination,
                  origin: origin,
                  travelMode: google.maps.TravelMode.DRIVING,
                }}
                callback={directionsCallback}
              />
            )}
            {directions && (
              <DirectionsRenderer
                options={{
                  directions: directions,
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div>Loading...</div>
        )}
        <div className="mt-4">
          <p><strong>From:</strong> {origin}</p>
          <p><strong>To:</strong> {destination}</p>
          <p><strong>Distance:</strong> {distance}</p>
          <p><strong>Duration:</strong> {duration}</p>
          <h3 className="mt-2 font-bold">Steps:</h3>
          <ol className="list-decimal list-inside">
            {steps.map((step, index) => (
              <li key={index}>
                <span dangerouslySetInnerHTML={{ __html: step.instruction }} /> ({step.distance})
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}