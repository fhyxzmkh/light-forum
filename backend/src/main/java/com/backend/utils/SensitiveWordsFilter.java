package com.backend.utils;

import cn.hutool.core.util.CharUtil;
import cn.hutool.core.util.StrUtil;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

@Component
public class SensitiveWordsFilter {

    private static final Logger logger = LoggerFactory.getLogger(SensitiveWordsFilter.class);

    private static final String REPLACEMENT = "***";

    private TrieNode root = new TrieNode();

    @PostConstruct
    public void init() {

        try (
                InputStream is = this.getClass().getClassLoader().getResourceAsStream("sensitive-words.txt");
                BufferedReader reader = new BufferedReader(new InputStreamReader(is));
        ) {
            String keyword;
            while ((keyword = reader.readLine()) != null) {
                TrieNode node = root;
                for (int i = 0; i < keyword.length(); i++) {
                    char c = keyword.charAt(i);
                    TrieNode subNode = node.getSubNodes().get(c);
                    if (subNode == null) {
                        subNode = new TrieNode();
                        node.getSubNodes().put(c, subNode);
                    }
                    node = subNode;
                    if (i == keyword.length() - 1) {
                        node.setEnd(true);
                    }
                }
            }

        } catch (IOException e) {
            logger.error("Failed to load sensitive words", e);
        }

    }

    public String filter(String text) {
        if (StrUtil.isBlank(text)) {
            return null;
        }

        TrieNode node = root;
        int begin = 0;
        int position = 0;
        StringBuilder result = new StringBuilder();

        while (position < text.length()) {
            char c = text.charAt(position);

            if (isSymbol(c)) {
                if (node == root) {
                    result.append(c);
                    begin++;
                }
                position++;
                continue;
            }

            node = node.getSubNodes().get(c);

            if (node == null) {
                result.append(text.charAt(begin));
                position = ++begin;
                node = root;
            } else if (node.isEnd) {
                result.append(REPLACEMENT);
                begin = ++position;
                node = root;
            } else {
                position++;
            }
        }

        result.append(text.substring(begin));

        return result.toString();
    }

    private boolean isSymbol(char c) {
        return c < 0x2E80 || c > 0x9FFF || CharUtil.isLetter(c);
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    private class TrieNode {
        private boolean isEnd = false;
        private Map<Character, TrieNode> subNodes = new HashMap<>();
    }
}
