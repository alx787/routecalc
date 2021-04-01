package ru.ath.routecalc.model;

import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coordinates {

    @Getter
    @Setter
    private String lon;

    @Getter
    @Setter
    private String lat;

}
