package ru.ath.routecalc.model;

import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteSegment {

    @Getter
    @Setter
    private String name;

    @Getter
    @Setter
    private String distance;

    @Getter
    @Setter
    private String placebegin;

    @Getter
    @Setter
    private String placeend;

    @Getter
    @Setter
    private Coordinates coordinatesBegin;

    @Getter
    @Setter
    private Coordinates coordinatesEnd;


}
