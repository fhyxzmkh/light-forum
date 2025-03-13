package com.backend;

import com.backend.entity.pojo.DiscussPost;
import com.backend.es.DiscussPostRepository;
import com.backend.mapper.DiscussPostMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;

@SpringBootTest
public class EsTest {

    @Autowired
    private DiscussPostMapper discussPostMapper;

    @Autowired
    private DiscussPostRepository discussPostRepository;

    @Autowired
    private ElasticsearchTemplate elasticsearchTemplate;

    @Test
    public void testInsert() {
        discussPostRepository.save(discussPostMapper.selectById(318));
        discussPostRepository.save(discussPostMapper.selectById(317));
        discussPostRepository.save(discussPostMapper.selectById(316));
    }

    @Test
    public void testDelete() {
        discussPostRepository.deleteAll();
    }

    @Test
    public void testInsertALl() {
        QueryWrapper<DiscussPost> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", 150);
        discussPostRepository.saveAll(discussPostMapper.selectList(queryWrapper));
    }

}
