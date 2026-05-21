package com.startuphub.repository;

import com.startuphub.entity.Startup;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StartupRepository extends JpaRepository<Startup, Long> {

    Optional<Startup> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Startup> findAllByOrderByCreatedAtDesc();
}
