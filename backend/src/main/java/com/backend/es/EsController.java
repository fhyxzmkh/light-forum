package com.backend.es;

import com.alibaba.fastjson.JSONObject;
import com.backend.entity.pojo.DiscussPost;
import com.backend.mapper.UserMapper;
import com.backend.service.LikeService;
import com.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedList;
import java.util.List;

import static com.backend.entity.constant.CommunityConstant.ENTITY_TYPE_POST;

@RestController
public class EsController {

    @Autowired
    private EsService esService;

    @Autowired
    private LikeService likeService;

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/search")
    public JSONObject search(
            @RequestParam String keyword, @RequestParam Integer current, @RequestParam Integer limit
    ) {
        Page<DiscussPost> posts = esService.searchDiscussPost(keyword, current, limit);

        List<JSONObject> items = new LinkedList<>();
        for (DiscussPost post : posts.getContent()) {
            JSONObject item = new JSONObject();

            item.put("post", post);
            item.put("author", userMapper.selectById(post.getUserId()).getUsername());
            item.put("likes", likeService.findEntityLikeCount(ENTITY_TYPE_POST, post.getId()));

            items.add(item);
        }

        JSONObject resp = new JSONObject();
        resp.put("search_result", items);
        resp.put("total", posts.getTotalElements());
        return resp;
    }

}
