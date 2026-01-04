package com.officely.backend.service;

public interface Geocoding {

    class GeoPoint{
        private final double lat;
        private final double lng;

        public GeoPoint(double lat, double lng){
            this.lat = lat;
            this.lng = lng;
        }

        public double getLat() { return lat; }
        public double getLng() { return lng; }
    }
    GeoPoint geocode(String address);
}
