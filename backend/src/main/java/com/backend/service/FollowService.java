package com.backend.service;

import java.util.List;
import java.util.Map;

public interface FollowService {

    // 关注
    void follow(int userId, int entityType, int entityId);

    // 取消关注
    void unfollow(int userId, int entityType, int entityId);

    // 查询某个用户关注的实体的数量
    Long findFolloweeCount(int userId, int entityType);

    // 查询某个实体的粉丝的数量
    Long findFollowerCount(int entityType, int entityId);

    // 查询当前用户是否关注某个实体
    boolean hasFollowed(int userId, int entityType, int entityId);

    // 查询某用户关注的人
    List<Map<String, Object>> findFollowees(int userId, int offset, int limit);

    // 查询某用户的粉丝
    List<Map<String, Object>> findFollowers(int userId, int offset, int limit);
}
