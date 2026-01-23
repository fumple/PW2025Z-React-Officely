package com.officely.backend.service;

import com.officely.backend.api.throwables.ValidationException;
import com.officely.backend.entity.OfficeEntity;
import com.officely.backend.entity.OfficeMemberEntity;
import com.officely.backend.entity.UserEntity;
import com.officely.backend.repository.OfficeMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class OfficeMemberService {
    private static final int MAX_MEMBERS = 50;
    private final OfficeMemberRepository officeMemberRepository;

    public List<OfficeMemberEntity> getMembers(Long officeId) {
        return officeMemberRepository.getByOfficeId(officeId);
    }

    public Optional<OfficeMemberEntity> getMember(Long officeId, Long membershipId) {
        return officeMemberRepository.findByIdAndOfficeId(membershipId, officeId);
    }

    public Optional<OfficeMemberEntity> getMemberByUserId(Long officeId, Long userId) {
        return officeMemberRepository.findByUserIdAndOfficeId(userId, officeId);
    }

    public void deleteMember(Long officeId, Long membershipId) {
        officeMemberRepository.deleteByIdAndOfficeId(membershipId, officeId);
    }
    @Transactional
    public OfficeMemberEntity createMember(OfficeEntity office, UserEntity user) {
        if(office.getOwner().getId().equals(user.getId())) {
            throw new ValidationException("", "User is already the owner of the office");
        }
        var members = getMembers(office.getId());
        if(members.stream().anyMatch(e -> e.getUser().getId().equals(user.getId()))) {
            throw new ValidationException("", "User is already a member of the office");
        }
        if(members.size() >= MAX_MEMBERS) {
            throw new ValidationException("", "The limit of 50 members was reached");
        }
        var member = new OfficeMemberEntity();
        member.setOffice(office);
        member.setUser(user);
        officeMemberRepository.save(member);
        return member;
    }
}
