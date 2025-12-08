package com.pdiagnosis.applicationService.repositories;


import com.pdiagnosis.applicationService.model.MedicalCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalCardRepository extends JpaRepository<MedicalCard, Long> {

    List<MedicalCard> findByUserId(Integer userId);
}
