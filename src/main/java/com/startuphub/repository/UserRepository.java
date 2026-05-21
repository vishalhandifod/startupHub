package com.startuphub.repository;

import com.startuphub.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
        select u from User u
        where lower(u.name) like lower(concat('%', :query, '%'))
            or lower(u.email) like lower(concat('%', :query, '%'))
        order by u.name asc
        """)
    List<User> searchTop10ByNameOrEmail(@Param("query") String query);
}
