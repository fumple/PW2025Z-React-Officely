package com.officely.backend.repository;

import com.officely.backend.entity.OfficeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfficeRepository extends JpaRepository<OfficeEntity, Long>, JpaSpecificationExecutor<OfficeEntity>{

}
