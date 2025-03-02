package com.backend;

import com.backend.utils.SensitiveWordsFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private SensitiveWordsFilter sensitiveWordsFilter;

    @Test
    public void test01() {
        System.out.println(sensitiveWordsFilter.filter("你好赌博"));
        System.out.println(sensitiveWordsFilter.filter("你好$赌$博$"));
        System.out.println(sensitiveWordsFilter.filter("你好#嫖☆娼##"));
        System.out.println(sensitiveWordsFilter.filter("你好 嫖 娼 "));
        System.out.println(sensitiveWordsFilter.filter("hello"));
    }
}
