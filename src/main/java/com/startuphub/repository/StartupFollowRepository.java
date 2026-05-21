package com.startuphub.repository;

import com.startuphub.entity.StartupFollow;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StartupFollowRepository extends JpaRepository<StartupFollow, Long> {

    long countByStartupId(Long startupId);

    boolean existsByUserIdAndStartupId(Long userId, Long startupId);

    Optional<StartupFollow> findByUserIdAndStartupId(Long userId, Long startupId);
}
