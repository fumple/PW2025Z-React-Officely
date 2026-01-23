package com.officely.backend.repository;

import com.officely.backend.entity.OfficeMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfficeMemberRepository extends JpaRepository<OfficeMemberEntity, Long> {
    List<OfficeMemberEntity> getByOfficeId(Long officeId);
    Optional<OfficeMemberEntity> findByUserIdAndOfficeId(Long userId, Long officeId);
    Optional<OfficeMemberEntity> findByIdAndOfficeId(Long id, Long officeId);
    void deleteByIdAndOfficeId(Long id, Long officeId);
}
