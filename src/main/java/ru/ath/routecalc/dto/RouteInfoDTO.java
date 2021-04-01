package ru.ath.routecalc.dto;

import lombok.*;
import ru.ath.routecalc.model.Coordinates;
import ru.ath.routecalc.model.RouteSegment;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteInfoDTO {

    @Getter
    @Setter
    private List<RouteSegment> segments; // массив сегментов маршрута по заданным точкам

    @Getter
    @Setter
    private List<Coordinates> coordinates; // массив координат вычисленного маршрута


}
