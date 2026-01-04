package com.officely.backend.service;

import org.springframework.stereotype.Service;
import com.officely.backend.api.filters.FilterElement;
import com.officely.backend.api.filters.FilterFlag;
import com.officely.backend.api.filters.FilterSection;

import java.util.List;

@Service
public class FiltersService {

    public List<FilterSection> getFilters(){
        FilterElement workspaceTypeElement = new FilterElement(
                "workspace.type",
                "Workspace type",
                "flags"
        );
        workspaceTypeElement.setFlags(List.of(
                new FilterFlag("desk", "Desk"),
                new FilterFlag("private-office", "Private office")
        ));

        FilterSection workspaceSection = new FilterSection(
                "workspace",
                "Workspace",
                List.of(workspaceTypeElement)
        );



        FilterElement wifiElement = new FilterElement(
                "amenity.wifi",
                "Wi-Fi",
                "flags"
        );
        wifiElement.setFlags(List.of(
                new FilterFlag("true", "Wi-Fi")
        ));

        FilterElement access24Element = new FilterElement(
                "amenity.24h",
                "24/7 Access",
                "flags"
        );
        access24Element.setFlags(List.of(
                new FilterFlag("true", "24/7 Access")
        ));

        FilterElement kitchenElement = new FilterElement(
                "amenity.kitchen",
                "Kitchen",
                "flags"
        );
        kitchenElement.setFlags(List.of(
                new FilterFlag("true", "Kitchen")
        ));

        FilterElement parkingElement = new FilterElement(
                "amenity.parking",
                "Parking",
                "flags"
        );
        parkingElement.setFlags(List.of(
                new FilterFlag("true", "Parking")
        ));

        FilterElement wheelchairElement = new FilterElement(
                "amenity.wheelchair",
                "Wheelchair access",
                "flags"
        );
        wheelchairElement.setFlags(List.of(
                new FilterFlag("true", "Wheelchair access")
        ));

        FilterSection amenitiesSection = new FilterSection(
                "amenities",
                "Amenities",
                List.of(wifiElement, access24Element, kitchenElement,
                        parkingElement, wheelchairElement)
        );



        FilterElement quietElement = new FilterElement(
                "env.quiet",
                "Quiet area",
                "flags"
        );
        quietElement.setFlags(List.of(
                new FilterFlag("true", "Quiet area")
        ));

        FilterElement socialElement = new FilterElement(
                "env.social",
                "Social / community vibe",
                "flags"
        );
        socialElement.setFlags(List.of(
                new FilterFlag("true", "Social / community vibe")
        ));

        FilterSection environmentSection = new FilterSection(
                "environment",
                "Environment",
                List.of(quietElement, socialElement)
        );



        FilterElement monitorElement = new FilterElement(
                "equipment.monitor",
                "Monitor included",
                "flags"
        );
        monitorElement.setFlags(List.of(
                new FilterFlag("true", "Monitor included")
        ));

        FilterElement printingElement = new FilterElement(
                "equipment.printing",
                "Printer",
                "flags"
        );
        printingElement.setFlags(List.of(
                new FilterFlag("true", "Printer")
        ));

        FilterSection equipmentSection = new FilterSection(
                "equipment",
                "Equipment",
                List.of(monitorElement, printingElement)
        );



        FilterElement priceElement = new FilterElement(
                "price",
                "Price per day",
                "integer"
        );

        priceElement.setMin(0);
        priceElement.setMax(2000);

        FilterSection priceSection = new FilterSection(
                "price",
                "Price",
                List.of(priceElement)
        );

        return List.of(workspaceSection, amenitiesSection, environmentSection, equipmentSection, priceSection);
    }
}
