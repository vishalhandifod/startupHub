package com.startuphub.repository;

import com.startuphub.entity.Post;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByAuthorIdInOrderByCreatedAtDesc(List<Long> authorIds);
}
