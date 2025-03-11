package com.backend.service;

public interface LikeService {

    // 点赞
    void like(int entityType, int entityId, int entityUserId);

    // 查询某实体点赞的数量
    Long findEntityLikeCount(int entityType, int entityId);

    // 查询某人对某实体的点赞状态
    Integer findEntityLikeStatus(int entityType, int entityId);

    // 查询某个用户获得的赞
    Integer findUserLikeCount(int userId);

}
