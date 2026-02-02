package com.officely.backend.repository;

import com.officely.backend.entity.OfficeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OfficeRepository extends JpaRepository<OfficeEntity, Long>, JpaSpecificationExecutor<OfficeEntity>{
    Page<OfficeEntity> getByIdOrNameContainingIgnoreCaseOrAddressContainingIgnoreCase(Long id, String name, String address, Pageable pageable);
    Page<OfficeEntity> getByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(String name, String address, Pageable pageable);

    @Query("select distinct o from OfficeEntity o" +
            " left join OfficeMemberEntity m ON m.office.id = o.id" +
            " where o.owner.id = :userId OR m.user.id = :userId")
    Page<OfficeEntity> getByUserId(long userId, Pageable pageable);
    @Query("select distinct o from OfficeEntity o" +
            " left join OfficeMemberEntity m ON m.office.id = o.id" +
            " where (o.owner.id = :userId OR m.user.id = :userId) AND " +
            " (o.name ilike %:name% OR o.address ilike %:address% OR o.id = :id)")
    Page<OfficeEntity> getByUserIdAndIdOrNameSearchOrAddressSearch(long userId, long id, String name, String address, Pageable pageable);
    @Query("select distinct o from OfficeEntity o" +
            " left join OfficeMemberEntity m ON m.office.id = o.id" +
            " where (o.owner.id = :userId OR m.user.id = :userId) AND " +
            " (o.name ilike %:name% OR o.address ilike %:address%)")
    Page<OfficeEntity> getByUserIdAndNameSearchOrAddressSearch(long userId, String name, String address, Pageable pageable);
}
