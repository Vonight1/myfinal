-- ============================================
-- Seed Data ສຳລັບ Demo
-- ບໍລິສັດ 10 ຫົວ + ວຽກ 25 ປະກາດ + applicants 5 ຄົນ
-- ລະຫັດຜ່ານທັງໝົດ: 12345678
-- (bcrypt hash: $2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG)
-- ============================================

-- ===== Companies (10 ບໍລິສັດ) =====
INSERT INTO users (name, email, password, phone, role, company_name, company_description, company_address, company_industry, company_website, is_active) VALUES
('Admin Coffee', 'coffee@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02055111001', 'company', 'Lao Coffee House', 'ຮ້ານກາເຟຄຸນນະພາບສູງ ໃຫ້ບໍລິການກາເຟສົດ ແລະ ເຄື່ອງດື່ມ', 'ບ້ານ ໂພນພະເນົາ, ນະຄອນຫຼວງວຽງຈັນ', 'ຮ້ານອາຫານ', 'https://laocoffee.la', TRUE),
('TechWave Manager', 'tech@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02055111002', 'company', 'TechWave Laos', 'ບໍລິສັດເຕັກໂນໂລຊີຊັ້ນນຳ - ພັດທະນາ Software, Mobile Apps', 'ບ້ານ ສີສະຫວາດ, ນະຄອນຫຼວງວຽງຈັນ', 'ເຕັກໂນໂລຊີ', 'https://techwave.la', TRUE),
('Sabaidee Restaurant', 'sabaidee@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02055111003', 'company', 'ສະບາຍດີ Restaurant', 'ຮ້ານອາຫານລາວແທ້ ມີຫຼາຍສາຂາ', 'ບ້ານ ໂນນແສງຈັນ, ນະຄອນຫຼວງວຽງຈັນ', 'ຮ້ານອາຫານ', NULL, TRUE),
('Lao Mart HR', 'laomart@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02055111004', 'company', 'Lao Mart', 'ຊຸບເປີມາເຄັດທີ່ໃຫຍ່ທີ່ສຸດໃນລາວ ມີ 15 ສາຂາ', 'ບ້ານ ຫາຍໂສກ, ນະຄອນຫຼວງວຽງຈັນ', 'ຮ້ານຄ້າ', 'https://laomart.la', TRUE),
('EduLao Tutor', 'edulao@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02055111005', 'company', 'EduLao Academy', 'ສະຖາບັນສອນພິເສດ ຄະນິດສາດ, ພາສາອັງກິດ, IT', 'ບ້ານ ດົງປ່າແຫລງ, ນະຄອນຫຼວງວຽງຈັນ', 'ການສຶກສາ', NULL, TRUE),
('Health Plus', 'health@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02055111006', 'company', 'Health Plus Clinic', 'ຄຣີນິກສະຫມັຍໃໝ່ ບໍລິການກວດສຸຂະພາບ', 'ບ້ານ ສະພານທອງ, ນະຄອນຫຼວງວຽງຈັນ', 'ສຸຂະພາບ', 'https://healthplus.la', TRUE),
('Speedy Delivery', 'speedy@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02055111007', 'company', 'Speedy Delivery', 'ບໍລິການສົ່ງເຄື່ອງດ່ວນ ໃນນະຄອນຫຼວງວຽງຈັນ', 'ບ້ານ ສະພານທອງ, ນະຄອນຫຼວງວຽງຈັນ', 'ຂົນສົ່ງ', NULL, TRUE),
('Bank Lao', 'bank@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02055111008', 'company', 'Lao Commercial Bank', 'ທະນາຄານທຸລະກິດ ໃຫ້ບໍລິການການເງິນຄົບວົງຈອນ', 'ບ້ານ ສີສະຫວາດ, ນະຄອນຫຼວງວຽງຈັນ', 'ການເງິນ', 'https://lcb.la', TRUE),
('Marketing Pro', 'marketing@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02055111009', 'company', 'Marketing Pro Agency', 'ບໍລິສັດການຕະຫຼາດດິຈິຕອນ', 'ບ້ານ ໂພນພະເນົາ, ນະຄອນຫຼວງວຽງຈັນ', 'ການຕະຫຼາດ', NULL, TRUE),
('Service Hub', 'service@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02055111010', 'company', 'Service Hub Laos', 'ບໍລິການທົ່ວໄປ - ທຳຄວາມສະອາດ, ສ້ອມແປງ', 'ບ້ານ ໂນນແສງຈັນ, ນະຄອນຫຼວງວຽງຈັນ', 'ບໍລິການ', NULL, TRUE)
ON CONFLICT (email) DO NOTHING;

-- ===== Applicants (5 ຄົນ) =====
INSERT INTO users (name, email, password, phone, role, skills, education, is_active) VALUES
('ສຸກສຳພັນ ວົງໄຊ', 'somsamphan@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02077001001', 'applicant', 'JavaScript, React, Node.js, SQL', 'ປຣິນຍາຕີ ວິສະວະກຳຄອມພິວເຕີ - ມຊ', TRUE),
('ມະນີຈັນ ສຸພານຸວົງ', 'manychan@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02077001002', 'applicant', 'ການຕະຫຼາດ, Social Media, Photoshop', 'ປຣິນຍາຕີ ບໍລິຫານທຸລະກິດ - ມຊ', TRUE),
('ບຸນຍ້ອມ ພົມມະວົງ', 'bounyom@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02077001003', 'applicant', 'ການບັນຊີ, Excel, QuickBooks', 'ປຣິນຍາຕີ ການບັນຊີ - ສະຖາບັນເຕັກໂນໂລຊີ ສຸດສະກະ', TRUE),
('ສຸພານີ ໄຊຍະວົງ', 'souphany@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02077001004', 'applicant', 'ພາສາອັງກິດ, ການສຶກສາ, ການສື່ສານ', 'ປຣິນຍາຕີ ພາສາອັງກິດ - ມຊ', TRUE),
('ທະນະພອນ ໄຊຍະບຸດ', 'thanaphone@demo.la', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOflXmKMFi2cGqx3lFGjOMSaZlMJMGzjG', '02077001005', 'applicant', 'ການອອກແບບ, Figma, Adobe XD, UI/UX', 'ປຣິນຍາຕີ ນິເທດສິລະປະ - ມຊ', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ===== Jobs (25 ປະກາດ - approved ໝົດ) =====
-- ໃຊ້ subquery ດຶງ id ຂອງບໍລິສັດ ແລະ category
DO $$
DECLARE
  v_coffee_id INT; v_tech_id INT; v_restaurant_id INT; v_mart_id INT; v_edu_id INT;
  v_health_id INT; v_delivery_id INT; v_bank_id INT; v_marketing_id INT; v_service_id INT;
  v_cat_food INT; v_cat_shop INT; v_cat_edu INT; v_cat_tech INT; v_cat_market INT;
  v_cat_service INT; v_cat_finance INT; v_cat_health INT; v_cat_delivery INT; v_cat_other INT;
BEGIN
  SELECT id INTO v_coffee_id FROM users WHERE email = 'coffee@demo.la';
  SELECT id INTO v_tech_id FROM users WHERE email = 'tech@demo.la';
  SELECT id INTO v_restaurant_id FROM users WHERE email = 'sabaidee@demo.la';
  SELECT id INTO v_mart_id FROM users WHERE email = 'laomart@demo.la';
  SELECT id INTO v_edu_id FROM users WHERE email = 'edulao@demo.la';
  SELECT id INTO v_health_id FROM users WHERE email = 'health@demo.la';
  SELECT id INTO v_delivery_id FROM users WHERE email = 'speedy@demo.la';
  SELECT id INTO v_bank_id FROM users WHERE email = 'bank@demo.la';
  SELECT id INTO v_marketing_id FROM users WHERE email = 'marketing@demo.la';
  SELECT id INTO v_service_id FROM users WHERE email = 'service@demo.la';

  SELECT id INTO v_cat_food FROM categories WHERE name = 'ຮ້ານອາຫານ';
  SELECT id INTO v_cat_shop FROM categories WHERE name = 'ຮ້ານຄ້າ';
  SELECT id INTO v_cat_edu FROM categories WHERE name = 'ການສຶກສາ';
  SELECT id INTO v_cat_tech FROM categories WHERE name = 'ເຕັກໂນໂລຊີ';
  SELECT id INTO v_cat_market FROM categories WHERE name = 'ການຕະຫຼາດ';
  SELECT id INTO v_cat_service FROM categories WHERE name = 'ບໍລິການ';
  SELECT id INTO v_cat_finance FROM categories WHERE name = 'ການເງິນ';
  SELECT id INTO v_cat_health FROM categories WHERE name = 'ສຸຂະພາບ';
  SELECT id INTO v_cat_delivery FROM categories WHERE name = 'ຂົນສົ່ງ';
  SELECT id INTO v_cat_other FROM categories WHERE name = 'ອື່ນໆ';

  -- Coffee shop jobs
  INSERT INTO jobs (company_id, category_id, title, description, requirements, salary_min, salary_max, salary_type, location, job_type, work_days, work_hours, positions, status) VALUES
  (v_coffee_id, v_cat_food, 'ພະນັກງານຮ້ານກາເຟ (Barista)', 'ຮັບສະໝັກພະນັກງານຮ້ານກາເຟ ມີຄວາມຮັບຜິດຊອບ ໃຈເຢັນ ບໍລິການລູກຄ້າໄດ້ດີ', 'ອາຍຸ 18-30 ປີ, ມີປະສົບການຈະພິຈາລະນາພິເສດ', 1500000, 2500000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ຈັນ-ສຸກ', '14:00-22:00', 2, 'approved'),
  (v_coffee_id, v_cat_food, 'Cashier', 'ຮັບເງິນ ນັບເງິນ ບໍລິການລູກຄ້າ', 'ມີຄວາມຊື່ສັດ ໄວ້ໃຈໄດ້, ໃຊ້ POS ໄດ້', 1200000, 1800000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ສ-ອາ', '08:00-16:00', 1, 'approved');

  -- TechWave jobs
  INSERT INTO jobs (company_id, category_id, title, description, requirements, salary_min, salary_max, salary_type, location, job_type, work_days, work_hours, positions, status) VALUES
  (v_tech_id, v_cat_tech, 'Frontend Developer (React)', 'ພັດທະນາ Web Application ດ້ວຍ React.js + TailwindCSS', 'ປະສົບການ React ຢ່າງໜ້ອຍ 1 ປີ, ຮູ້ Git, REST API', 5000000, 10000000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'freelance', 'ຍືດຫຍຸ່ນ', 'WFH ໄດ້', 2, 'approved'),
  (v_tech_id, v_cat_tech, 'Mobile Developer (Flutter)', 'ພັດທະນາ Mobile App ດ້ວຍ Flutter', 'ປະສົບການ Flutter, ມີ portfolio', 6000000, 12000000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ຈັນ, ພຸດ, ສຸກ', '13:00-18:00', 1, 'approved'),
  (v_tech_id, v_cat_tech, 'UI/UX Designer', 'ອອກແບບ UI/UX ສຳລັບ Web ແລະ Mobile', 'ໃຊ້ Figma ຄ່ອງ, ມີ portfolio', 4000000, 8000000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'freelance', 'ຍືດຫຍຸ່ນ', 'WFH', 1, 'approved');

  -- Restaurant jobs
  INSERT INTO jobs (company_id, category_id, title, description, requirements, salary_min, salary_max, salary_type, location, job_type, work_days, work_hours, positions, status) VALUES
  (v_restaurant_id, v_cat_food, 'ພະນັກງານເສີບ', 'ບໍລິການລູກຄ້າ ຮັບອໍເດີ້ ສົ່ງອາຫານ', 'ມີຄວາມສຸພາບ ບໍລິການດີ', 1300000, 2000000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ທຸກວັນ', '17:00-23:00', 5, 'approved'),
  (v_restaurant_id, v_cat_food, 'ຜູ້ຊ່ວຍຄົວ', 'ຊ່ວຍກະກຽມວັດຖຸດິບ ລ້າງຈານ', 'ຂະຫຍັນ ສະອາດ', 1500000, 2200000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ຈັນ-ສຸກ', '10:00-18:00', 2, 'approved');

  -- Mart jobs
  INSERT INTO jobs (company_id, category_id, title, description, requirements, salary_min, salary_max, salary_type, location, job_type, work_days, work_hours, positions, status) VALUES
  (v_mart_id, v_cat_shop, 'ພະນັກງານຂາຍ', 'ບໍລິການລູກຄ້າ ຈັດສິນຄ້າ', 'ມີຄວາມສຸພາບ ບໍລິການດີ', 1500000, 2500000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ສ-ອາ', '08:00-20:00', 10, 'approved'),
  (v_mart_id, v_cat_shop, 'Stock Counter', 'ນັບສິນຄ້າ ກວດສິນຄ້າ', 'ມີຄວາມລະອຽດ', 200000, 300000, 'daily', 'ນະຄອນຫຼວງວຽງຈັນ', 'temporary', 'ວັນເສົາ', '08:00-17:00', 5, 'approved'),
  (v_mart_id, v_cat_shop, 'Cashier ສາຂາໃໝ່', 'ຮັບເງິນ POS', 'ໃຊ້ POS ໄດ້', 1400000, 2000000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ຈັນ-ສຸກ', '16:00-22:00', 3, 'approved');

  -- Edu jobs
  INSERT INTO jobs (company_id, category_id, title, description, requirements, salary_min, salary_max, salary_type, location, job_type, work_days, work_hours, positions, status) VALUES
  (v_edu_id, v_cat_edu, 'ຄູສອນພາສາອັງກິດ', 'ສອນພາສາອັງກິດໃຫ້ນັກຮຽນ ປ.5-ມ.6', 'TOEIC 700+, IELTS 6.0+', 80000, 150000, 'hourly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ສ-ອາ', '09:00-16:00', 3, 'approved'),
  (v_edu_id, v_cat_edu, 'ຄູສອນຄະນິດສາດ', 'ສອນຄະນິດສາດ ມ.4-ມ.6', 'ປຣິນຍາຕີ ຄະນິດສາດ ຫຼື ສາຂາທີ່ກ່ຽວຂ້ອງ', 70000, 130000, 'hourly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ສ-ອາ', '13:00-18:00', 2, 'approved'),
  (v_edu_id, v_cat_edu, 'ຄູສອນ Coding (Scratch, Python)', 'ສອນເດັກນ້ອຍ 8-15 ປີ', 'ມີຄວາມຮູ້ Python ຫຼື Scratch', 100000, 200000, 'hourly', 'ນະຄອນຫຼວງວຽງຈັນ', 'freelance', 'ຍືດຫຍຸ່ນ', 'Online ໄດ້', 2, 'approved');

  -- Health jobs
  INSERT INTO jobs (company_id, category_id, title, description, requirements, salary_min, salary_max, salary_type, location, job_type, work_days, work_hours, positions, status) VALUES
  (v_health_id, v_cat_health, 'ພະຍາບານ Part-time', 'ປະຈຳຄຣີນິກ ກວດສຸຂະພາບເບື້ອງຕົ້ນ', 'ປຣິນຍາຕີ ພະຍາບານ ມີໃບອະນຸຍາດ', 3000000, 5000000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ຈັນ-ສຸກ', '14:00-20:00', 2, 'approved'),
  (v_health_id, v_cat_health, 'Receptionist ຄຣີນິກ', 'ຕ້ອນຮັບລູກຄ້າ ນັດໝາຍ', 'ມີຄວາມສຸພາບ ໃຊ້ຄອມໄດ້', 1800000, 2800000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ຈັນ-ສຸກ', '08:00-14:00', 1, 'approved');

  -- Delivery jobs
  INSERT INTO jobs (company_id, category_id, title, description, requirements, salary_min, salary_max, salary_type, location, job_type, work_days, work_hours, positions, status) VALUES
  (v_delivery_id, v_cat_delivery, 'Driver ສົ່ງເຄື່ອງ', 'ສົ່ງເຄື່ອງໃນນະຄອນຫຼວງ', 'ມີລົດຈັກ ມີໃບຂັບຂີ່', 50000, 80000, 'daily', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ທຸກວັນ', 'ຍືດຫຍຸ່ນ', 10, 'approved'),
  (v_delivery_id, v_cat_delivery, 'Dispatcher', 'ຮັບອໍເດີ້ ສົ່ງໃຫ້ driver', 'ໃຊ້ໂປຣແກຣມໄດ້', 2000000, 3000000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ຈັນ-ສຸກ', '08:00-17:00', 1, 'approved');

  -- Bank jobs
  INSERT INTO jobs (company_id, category_id, title, description, requirements, salary_min, salary_max, salary_type, location, job_type, work_days, work_hours, positions, status) VALUES
  (v_bank_id, v_cat_finance, 'Customer Service ທະນາຄານ', 'ບໍລິການລູກຄ້າ ໃຫ້ຂໍ້ມູນ', 'ປຣິນຍາຕີ ບໍລິຫານ ຫຼື ການເງິນ', 3500000, 5500000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'internship', 'ຈັນ-ສຸກ', '08:00-16:30', 3, 'approved'),
  (v_bank_id, v_cat_finance, 'ນັກສຶກສາຝຶກງານ ຝ່າຍບັນຊີ', 'ຝຶກງານ 3-6 ເດືອນ', 'ນັກສຶກສາປີສຸດທ້າຍ', 1500000, 2500000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'internship', 'ຈັນ-ສຸກ', '08:00-17:00', 5, 'approved');

  -- Marketing jobs
  INSERT INTO jobs (company_id, category_id, title, description, requirements, salary_min, salary_max, salary_type, location, job_type, work_days, work_hours, positions, status) VALUES
  (v_marketing_id, v_cat_market, 'Social Media Manager', 'ຈັດການ Facebook, Instagram, TikTok', 'ມີປະສົບການ, ມີຄວາມຄິດສ້າງສັນ', 3000000, 5000000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'freelance', 'ຍືດຫຍຸ່ນ', 'WFH', 2, 'approved'),
  (v_marketing_id, v_cat_market, 'Content Writer', 'ຂຽນບົດຄວາມ ໂພສ Social', 'ມີ portfolio, ພາສາລາວ + ອັງກິດດີ', 80000, 150000, 'hourly', 'ນະຄອນຫຼວງວຽງຈັນ', 'freelance', 'ຍືດຫຍຸ່ນ', 'WFH', 3, 'approved'),
  (v_marketing_id, v_cat_market, 'Graphic Designer', 'ອອກແບບ ໂພສເຕີ ໂບຣຊົວ', 'Photoshop, Illustrator ຄ່ອງ', 2500000, 4500000, 'monthly', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ຈັນ-ສຸກ', '14:00-19:00', 1, 'approved');

  -- Service jobs
  INSERT INTO jobs (company_id, category_id, title, description, requirements, salary_min, salary_max, salary_type, location, job_type, work_days, work_hours, positions, status) VALUES
  (v_service_id, v_cat_service, 'ພະນັກງານທຳຄວາມສະອາດ', 'ທຳຄວາມສະອາດອາຄານ', 'ຂະຫຍັນ ສະອາດ', 80000, 120000, 'daily', 'ນະຄອນຫຼວງວຽງຈັນ', 'part-time', 'ຈັນ-ສຸກ', '06:00-10:00', 5, 'approved'),
  (v_service_id, v_cat_service, 'ຊ່າງສ້ອມແປງ AC', 'ສ້ອມແອຣ໌ ບຳລຸງຮັກສາ', 'ມີປະສົບການ ມີເຄື່ອງມື', 200000, 400000, 'daily', 'ນະຄອນຫຼວງວຽງຈັນ', 'freelance', 'ຍືດຫຍຸ່ນ', 'ຕາມນັດ', 2, 'approved');

END $$;

-- ===== ສະຫຼຸບ =====
-- ດີໂມເພີ່ມຂໍ້ມູນ: 10 ບໍລິສັດ + 5 applicants + 25 ວຽກ
-- Login ດ້ວຍ email ໃດກໍ່ໄດ້ + ລະຫັດ "12345678"
-- ບໍລິສັດ: coffee@demo.la, tech@demo.la, ...
-- Applicant: somsamphan@demo.la, manychan@demo.la, ...

SELECT 'Seed data complete: ' ||
  (SELECT COUNT(*) FROM users WHERE email LIKE '%@demo.la' AND role = 'company') || ' companies, ' ||
  (SELECT COUNT(*) FROM users WHERE email LIKE '%@demo.la' AND role = 'applicant') || ' applicants, ' ||
  (SELECT COUNT(*) FROM jobs j JOIN users u ON j.company_id = u.id WHERE u.email LIKE '%@demo.la') || ' jobs'
AS result;
