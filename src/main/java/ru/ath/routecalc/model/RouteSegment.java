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
    private Double distance;

    @Getter
    @Setter
    private String placebegin;

    @Getter
    @Setter
    private String placeend;

    // координаты начала и окончания сегмента
    @Getter
    @Setter
    private Coordinates coordinatesBegin;

    @Getter
    @Setter
    private Coordinates coordinatesEnd;

    // индексы координат начала и окончания в массиве координат для получения сегментов маршрута
    @Getter
    @Setter
    private int wayPointBegin;

    @Getter
    @Setter
    private int wayPointEnd;

}
