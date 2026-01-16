package com.officely.backend.service;

public interface Geocoding {

    class GeoPoint{
        private final double lat;
        private final double lon;

        public GeoPoint(double lat, double lon){
            this.lat = lat;
            this.lon = lon;
        }

        public double getLat() { return lat; }
        public double getLng() { return lon; }
    }
    GeoPoint geocode(String address);
}
