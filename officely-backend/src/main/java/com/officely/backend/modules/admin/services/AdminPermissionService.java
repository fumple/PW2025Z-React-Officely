package com.officely.backend.modules.admin.services;

import com.officely.backend.entity.BookingEntity;
import com.officely.backend.entity.OfficeEntity;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.repository.OfficeMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AdminPermissionService {
    private final OfficeMemberRepository officeMemberRepository;

    public boolean canViewUser(UserEntity actor, UserEntity targetUser) {
        if(actor.isAdmin())
            return true;
        if(actor.getId().equals(targetUser.getId()))
            return true;
        // TODO: Real permission check
        return true;
    }
    public boolean canUpdateUser(UserEntity actor, UserEntity targetUser) {
        if(actor.isAdmin())
            return true;
        if(actor.getId().equals(targetUser.getId()))
            return true;
        return false;
    }
    public boolean canBlockUser(UserEntity actor, UserEntity targetUser) {
        if(actor.isAdmin())
            return true;
        return false;
    }

    public boolean canManageOffice(UserEntity actor, OfficeEntity target) {
        if(actor.isAdmin())
            return true;
        if(target.getOwner().getId().equals(actor.getId()))
            return true;
        return officeMemberRepository.findByUserIdAndOfficeId(actor.getId(), target.getId()).isPresent();
    }
    public boolean canUpdateOfficeDetails(UserEntity actor, OfficeEntity target) {
        if(actor.isAdmin())
            return true;
        if(target.getOwner().getId().equals(actor.getId()))
            return true;
        return false;
    }

    public boolean canAccessBooking(UserEntity actor, BookingEntity target) {
        if(actor.isAdmin())
            return true;
        return canManageOffice(actor, target.getOffice());
    }
}
