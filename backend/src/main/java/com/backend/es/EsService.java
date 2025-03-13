package com.backend.es;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.MultiMatchQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.elasticsearch.core.search.Highlight;
import co.elastic.clients.elasticsearch.core.search.HighlightField;
import com.backend.entity.pojo.DiscussPost;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EsService {

    @Autowired
    private DiscussPostRepository discussPostRepository;

    @Autowired
    private ElasticsearchClient elasticsearchClient;

    public void saveDiscussPost(DiscussPost discussPost) {
        discussPostRepository.save(discussPost);
    }

    public void deleteDiscussPost(int id) {
        discussPostRepository.deleteById(id);
    }

    public Page<DiscussPost> searchDiscussPost(String keyword, int current, int limit) {
        int from = (current - 1) * limit;
        int size = limit;

        Query multiMatchQuery = MultiMatchQuery.of(m -> m
                .query(keyword)
                .fields("title", "content")
        )._toQuery();

        Highlight highlight = Highlight.of(h -> h
                .fields("title", f -> f)
                .fields("content", f -> f)
                .preTags("<em>")
                .postTags("</em>")
        );

        SearchRequest searchRequest = SearchRequest.of(s -> s
                .index("discuss_post")
                .query(multiMatchQuery)
                .from(from)
                .size(size)
                .sort(ss -> ss.field(f -> f.field("type").order(SortOrder.Desc)))
                .sort(ss -> ss.field(f -> f.field("score").order(SortOrder.Desc)))
                .sort(ss -> ss.field(f -> f.field("createTime").order(SortOrder.Desc)))
                .highlight(highlight)
        );

        try {
            SearchResponse<DiscussPost> response = elasticsearchClient.search(searchRequest, DiscussPost.class);
            List<DiscussPost> discussPosts = processSearchResponse(response);
            long totalHits = response.hits().total().value();
            PageRequest pageRequest = PageRequest.of(current - 1, limit);
            return new PageImpl<>(discussPosts, pageRequest, totalHits);
        } catch (IOException e) {
            // 处理异常，例如记录日志或抛出自定义异常
            throw new RuntimeException("Failed to search discuss posts", e);
        }
    }

    private List<DiscussPost> processSearchResponse(SearchResponse<DiscussPost> response) {
        List<DiscussPost> discussPosts = new ArrayList<>();
        for (Hit<DiscussPost> hit : response.hits().hits()) {
            DiscussPost post = hit.source();
            if (post != null) {
                processHighlightFields(hit, post);
                discussPosts.add(post);
            }
        }
        return discussPosts;
    }

    private void processHighlightFields(Hit<DiscussPost> hit, DiscussPost post) {
        hit.highlight().forEach((field, fragments) -> {
            String merged = String.join("...", fragments); // 合并多个片段
            if ("title".equals(field)) {
                post.setTitle(merged);
            } else if ("content".equals(field)) {
                post.setContent(merged);
            }
        });
    }
}