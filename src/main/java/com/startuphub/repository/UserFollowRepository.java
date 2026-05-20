package com.startuphub.repository;

import com.startuphub.entity.UserFollow;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {

    long countByFollowingId(Long userId);

    long countByFollowerId(Long userId);

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    Optional<UserFollow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    List<UserFollow> findByFollowingId(Long userId);

    List<UserFollow> findByFollowerId(Long userId);
}
