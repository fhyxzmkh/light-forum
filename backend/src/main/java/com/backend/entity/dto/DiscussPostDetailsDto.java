package com.backend.entity.dto;

import com.backend.entity.pojo.DiscussPost;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DiscussPostDetailsDto {

    DiscussPost discussPost;

    private Integer id;

    private String username;

    private String avatar;

    private Integer status;

    private Integer type;
}
