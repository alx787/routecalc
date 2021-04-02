package ru.ath.routecalc.model;

import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coordinates {

    @Getter
    @Setter
    private Double lon;
//    private String lon;

    @Getter
    @Setter
    private Double lat;
//    private String lat;

}
