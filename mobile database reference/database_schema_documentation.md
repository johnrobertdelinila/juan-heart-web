# Juan Heart App - Database Schema Documentation

## Overview
This document outlines the database schema requirements for the Juan Heart cardiovascular risk assessment application based on the sample assessment data structures.

## Core Tables

### 1. **users**
Primary user information and profile data.

```sql
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    sex ENUM('Male', 'Female', 'Other'),
    language_preference ENUM('en', 'fil') DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 2. **user_locations**
User location information for facility recommendations.

```sql
CREATE TABLE user_locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    country VARCHAR(100) DEFAULT 'Philippines',
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 3. **assessments**
Main assessment records linking to all assessment data.

```sql
CREATE TABLE assessments (
    assessment_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(50) NOT NULL,
    assessment_date TIMESTAMP NOT NULL,
    version VARCHAR(10) DEFAULT '1.0.0',
    completion_rate DECIMAL(5,2) DEFAULT 100.00,
    assessment_duration_minutes INT,
    data_quality_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 4. **assessment_symptoms**
Detailed symptom information from assessments.

```sql
CREATE TABLE assessment_symptoms (
    symptom_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(50) NOT NULL,
    chest_pain_present BOOLEAN DEFAULT FALSE,
    chest_pain_type VARCHAR(50),
    chest_pain_duration_minutes INT,
    chest_pain_radiation BOOLEAN DEFAULT FALSE,
    chest_pain_exertional BOOLEAN DEFAULT FALSE,
    chest_pain_severity_scale INT CHECK (severity_scale >= 0 AND severity_scale <= 10),
    shortness_of_breath_present BOOLEAN DEFAULT FALSE,
    shortness_of_breath_level VARCHAR(50),
    shortness_of_breath_at_rest BOOLEAN DEFAULT FALSE,
    palpitations_present BOOLEAN DEFAULT FALSE,
    palpitations_type VARCHAR(50),
    palpitations_duration_hours INT,
    palpitations_heart_rate INT,
    syncope_present BOOLEAN DEFAULT FALSE,
    syncope_episodes INT DEFAULT 0,
    syncope_last_episode TIMESTAMP NULL,
    fainting_present BOOLEAN DEFAULT FALSE,
    fainting_episodes INT DEFAULT 0,
    neurological_symptoms_present BOOLEAN DEFAULT FALSE,
    dizziness BOOLEAN DEFAULT FALSE,
    confusion BOOLEAN DEFAULT FALSE,
    weakness BOOLEAN DEFAULT FALSE,
    leg_swelling BOOLEAN DEFAULT FALSE,
    sweating BOOLEAN DEFAULT FALSE,
    nausea BOOLEAN DEFAULT FALSE,
    fatigue BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id)
);
```

### 5. **assessment_vital_signs**
Vital signs measurements from assessments.

```sql
CREATE TABLE assessment_vital_signs (
    vital_signs_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(50) NOT NULL,
    systolic_bp INT,
    diastolic_bp INT,
    heart_rate INT,
    oxygen_saturation INT,
    temperature DECIMAL(4,2),
    weight DECIMAL(5,2),
    height INT,
    bmi DECIMAL(4,2),
    bmi_category VARCHAR(20),
    measurement_time TIMESTAMP,
    device_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id)
);
```

### 6. **assessment_medical_history**
Medical history and chronic conditions.

```sql
CREATE TABLE assessment_medical_history (
    medical_history_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(50) NOT NULL,
    -- Cardiovascular history
    previous_heart_disease BOOLEAN DEFAULT FALSE,
    heart_attack BOOLEAN DEFAULT FALSE,
    stroke BOOLEAN DEFAULT FALSE,
    heart_surgery BOOLEAN DEFAULT FALSE,
    angina BOOLEAN DEFAULT FALSE,
    arrhythmia BOOLEAN DEFAULT FALSE,
    -- Chronic conditions
    hypertension BOOLEAN DEFAULT FALSE,
    diabetes BOOLEAN DEFAULT FALSE,
    high_cholesterol BOOLEAN DEFAULT FALSE,
    chronic_kidney_disease BOOLEAN DEFAULT FALSE,
    obesity BOOLEAN DEFAULT FALSE,
    -- Family history
    family_heart_disease BOOLEAN DEFAULT FALSE,
    family_stroke BOOLEAN DEFAULT FALSE,
    family_diabetes BOOLEAN DEFAULT FALSE,
    family_hypertension BOOLEAN DEFAULT FALSE,
    father_heart_disease_age INT,
    mother_heart_disease_age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id)
);
```

### 7. **assessment_medications**
Current medications and allergies.

```sql
CREATE TABLE assessment_medications (
    medication_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(50) NOT NULL,
    medication_name VARCHAR(255),
    dosage VARCHAR(100),
    frequency VARCHAR(50),
    start_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id)
);

CREATE TABLE assessment_allergies (
    allergy_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(50) NOT NULL,
    medication VARCHAR(255),
    reaction VARCHAR(255),
    severity VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id)
);
```

### 8. **assessment_lifestyle**
Lifestyle factors and habits.

```sql
CREATE TABLE assessment_lifestyle (
    lifestyle_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(50) NOT NULL,
    -- Smoking
    current_smoker BOOLEAN DEFAULT FALSE,
    former_smoker BOOLEAN DEFAULT FALSE,
    quit_date DATE,
    pack_years INT,
    -- Alcohol
    consumes_alcohol BOOLEAN DEFAULT FALSE,
    alcohol_frequency VARCHAR(50),
    units_per_week INT,
    binge_drinking BOOLEAN DEFAULT FALSE,
    -- Exercise
    regular_exercise BOOLEAN DEFAULT FALSE,
    exercise_frequency_per_week INT,
    exercise_duration_minutes INT,
    exercise_intensity VARCHAR(50),
    -- Diet
    diet_type VARCHAR(50),
    fruits_vegetables_daily BOOLEAN DEFAULT FALSE,
    processed_foods_level VARCHAR(50),
    sodium_intake_level VARCHAR(50),
    -- Stress
    stress_level VARCHAR(50),
    work_stress BOOLEAN DEFAULT FALSE,
    family_stress BOOLEAN DEFAULT FALSE,
    -- Sleep
    average_sleep_hours DECIMAL(3,1),
    sleep_quality VARCHAR(50),
    sleep_apnea BOOLEAN DEFAULT FALSE,
    insomnia BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id)
);
```

### 9. **assessment_results**
Risk assessment calculation results.

```sql
CREATE TABLE assessment_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(50) NOT NULL,
    likelihood_score INT CHECK (likelihood_score >= 1 AND likelihood_score <= 5),
    likelihood_level VARCHAR(50),
    impact_score INT CHECK (impact_score >= 1 AND impact_score <= 5),
    impact_level VARCHAR(50),
    final_risk_score INT CHECK (final_risk_score >= 1 AND final_risk_score <= 25),
    risk_category VARCHAR(50),
    color_code VARCHAR(50),
    urgency VARCHAR(50),
    timeframe VARCHAR(100),
    confidence_level DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id)
);
```

### 10. **assessment_recommendations**
Care recommendations and action plans.

```sql
CREATE TABLE assessment_recommendations (
    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(50) NOT NULL,
    immediate_action TEXT,
    recommended_facility_types JSON,
    care_plan_monitoring JSON,
    care_plan_lifestyle_changes JSON,
    care_plan_medical_follow_up JSON,
    emergency_instructions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id)
);
```

### 11. **healthcare_facilities**
Healthcare facility information for referrals.

```sql
CREATE TABLE healthcare_facilities (
    facility_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    facility_type ENUM('Barangay Health Center', 'Primary Care Clinic', 'Hospital', 'Emergency Facility'),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(50),
    is_24_7 BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 12. **referrals**
Referral records linking assessments to facilities.

```sql
CREATE TABLE referrals (
    referral_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(50) NOT NULL,
    facility_id INT NOT NULL,
    referral_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'accepted', 'completed', 'cancelled') DEFAULT 'pending',
    pdf_generated BOOLEAN DEFAULT FALSE,
    pdf_path VARCHAR(500),
    shared_via VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id),
    FOREIGN KEY (facility_id) REFERENCES healthcare_facilities(facility_id)
);
```

### 13. **assessment_metadata**
Technical and device metadata.

```sql
CREATE TABLE assessment_metadata (
    metadata_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(50) NOT NULL,
    device_platform VARCHAR(50),
    device_version VARCHAR(50),
    app_version VARCHAR(20),
    screen_resolution VARCHAR(20),
    gps_accuracy_meters INT,
    location_source VARCHAR(50),
    api_version VARCHAR(10),
    algorithm_version VARCHAR(20),
    model_confidence DECIMAL(3,2),
    processing_time_ms INT,
    timezone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id)
);
```

### 14. **data_privacy_consent**
Privacy and consent tracking.

```sql
CREATE TABLE data_privacy_consent (
    consent_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    assessment_id VARCHAR(50) NOT NULL,
    consent_given BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMP,
    share_with_healthcare_providers BOOLEAN DEFAULT FALSE,
    share_for_research BOOLEAN DEFAULT FALSE,
    share_anonymized_data BOOLEAN DEFAULT FALSE,
    retention_period_years INT DEFAULT 7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (assessment_id) REFERENCES assessments(assessment_id)
);
```

## Indexes for Performance

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Assessment queries
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_date ON assessments(assessment_date);
CREATE INDEX idx_assessments_session ON assessments(session_id);

-- Risk level queries
CREATE INDEX idx_results_risk_category ON assessment_results(risk_category);
CREATE INDEX idx_results_final_score ON assessment_results(final_risk_score);

-- Facility searches
CREATE INDEX idx_facilities_location ON healthcare_facilities(latitude, longitude);
CREATE INDEX idx_facilities_type ON healthcare_facilities(facility_type);
CREATE INDEX idx_facilities_city ON healthcare_facilities(city);

-- Referral tracking
CREATE INDEX idx_referrals_assessment ON referrals(assessment_id);
CREATE INDEX idx_referrals_facility ON referrals(facility_id);
CREATE INDEX idx_referrals_status ON referrals(status);
```

## Data Relationships

```
users (1) ──→ (many) assessments
users (1) ──→ (many) user_locations
assessments (1) ──→ (1) assessment_symptoms
assessments (1) ──→ (1) assessment_vital_signs
assessments (1) ──→ (1) assessment_medical_history
assessments (1) ──→ (1) assessment_lifestyle
assessments (1) ──→ (1) assessment_results
assessments (1) ──→ (1) assessment_recommendations
assessments (1) ──→ (1) assessment_metadata
assessments (1) ──→ (many) referrals
healthcare_facilities (1) ──→ (many) referrals
```

## Sample Queries

### Get user's assessment history
```sql
SELECT a.assessment_id, a.assessment_date, ar.risk_category, ar.final_risk_score
FROM assessments a
JOIN assessment_results ar ON a.assessment_id = ar.assessment_id
WHERE a.user_id = 'USER_12345'
ORDER BY a.assessment_date DESC;
```

### Find nearby facilities
```sql
SELECT *, 
    (6371 * acos(cos(radians(14.6760)) * cos(radians(latitude)) * 
     cos(radians(longitude) - radians(121.0437)) + 
     sin(radians(14.6760)) * sin(radians(latitude)))) AS distance
FROM healthcare_facilities
WHERE is_active = TRUE
HAVING distance < 25
ORDER BY distance;
```

### Get high-risk assessments
```sql
SELECT a.assessment_id, u.full_name, ar.risk_category, ar.final_risk_score
FROM assessments a
JOIN users u ON a.user_id = u.user_id
JOIN assessment_results ar ON a.assessment_id = ar.assessment_id
WHERE ar.final_risk_score >= 15
ORDER BY ar.final_risk_score DESC;
```

## Data Retention and Privacy

- **Retention Period**: 7 years (configurable per user consent)
- **Anonymization**: Personal identifiers can be anonymized while preserving medical data
- **Encryption**: All sensitive data encrypted at rest
- **Access Control**: Role-based access for healthcare providers
- **Audit Trail**: All data access logged for compliance

## Backup and Recovery

- **Daily Backups**: Full database backups
- **Point-in-time Recovery**: Transaction log backups every 15 minutes
- **Geographic Redundancy**: Backups stored in multiple regions
- **Disaster Recovery**: RTO < 4 hours, RPO < 1 hour
