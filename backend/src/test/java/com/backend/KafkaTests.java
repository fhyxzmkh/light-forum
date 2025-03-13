package com.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@SpringBootTest
public class KafkaTests {

    @Autowired
    private KafkaProducer kafkaProducer;

    @Test
    public void test() {
        kafkaProducer.send("test", "hello1");
        kafkaProducer.send("test", "hello2");
        kafkaProducer.send("test", "hello3");

        try {
            Thread.sleep(1000 * 10);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

}

@Component
class KafkaProducer {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    public void send(String topic, String message) {
        kafkaTemplate.send(topic, message);
    }
}

@Component
class KafkaConsumer {

    @KafkaListener(topics = "test")
    public void listen(String message) {
        System.out.println(message);
    }
}
