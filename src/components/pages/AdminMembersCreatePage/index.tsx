"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, HStack } from "@chakra-ui/react";
import { Radio, RadioGroup } from "@/src/components/ui/radio";
import { useForm } from "@/src/hook/useForm";
import InputForm from "@/src/components/common/InputForm";
import InputFormLayout from "@/src/components/layouts/InputFormLayout";
import { defaultValuesOfMember } from "@/src/constants/defaultValues";
import { validationRulesOfCreatingMember } from "@/src/constants/validationRules";
import { createMember } from "@/src/api/members";
import { getOrganizationsApi } from "@/src/api/getOrganization";
import SelectedOrganization from "@/src/components/pages/AdminMembersCreatePage/components/SelectOrganization";

interface OrgProps {
  id: number;
  type: string;
  brNumber: string;
  name: string;
  brCertificateUrl: string;
  streetAddress: string;
  detailAddress: string;
  phoneNumber: string;
  status: string;
}

export default function AdminMembersCreatePage() {
  const route = useRouter();
  const { inputValues, inputErrors, handleInputChange, checkAllInputs } =
    useForm(defaultValuesOfMember, validationRulesOfCreatingMember);

  // 업체 관련 정보
  const [organizations, setOrganizations] = useState<OrgProps[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<OrgProps>();

  useEffect(() => {
    async function fetchOrganization() {
      try {
        const organizationData = await getOrganizationsApi();
        console.log("페칭출력", organizationData.data.dtoList);

        setOrganizations(organizationData.data.dtoList);
      } catch (error) {
        console.error("업체 정보 불러오지 못함 : ", error);
      }
    }
    fetchOrganization();
  }, []);

  function handleChange(inputName: string, value: string) {
    console.log("맞음");
    if (inputName === "phoneNum") {
      const onlyNumbers = value
        .toString()
        .replace(/[^0-9]/g, "")
        .slice(0, 11);

      let formattedValue = onlyNumbers;

      if (onlyNumbers.length > 3 && onlyNumbers.length <= 7) {
        formattedValue = `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(3)}`;
      } else if (onlyNumbers.length > 7) {
        formattedValue = `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(3, 7)}-${onlyNumbers.slice(7, 11)}`;
      }

      handleInputChange(inputName, formattedValue);
    } else {
      handleInputChange(inputName, value);
    }
  }

  function validateInputs() {
    if (!checkAllInputs()) {
      alert("입력값을 확인하세요.");
      return false;
    }
    return true;
  }
  console.log(
    inputValues.role,
    inputValues.organizationId,
    inputValues.name,
    inputValues.email,
    inputValues.password,
    inputValues.phoneNum,
    inputValues.jobRole,
    inputValues.jobTitle,
    inputValues.introduction,
    inputValues.remark,
  );
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateInputs()) return;
    try {
      console.log(
        "업체 정보 확인 -  String(selectedOrganization?.id) ",
        String(selectedOrganization?.id),
      );
      const response = await createMember(
        inputValues.role,
        String(selectedOrganization?.id),
        inputValues.name,
        inputValues.email,
        inputValues.password,
        inputValues.phoneNum,
        inputValues.jobRole,
        inputValues.jobTitle,
        inputValues.introduction,
        inputValues.remark,
      );

      // 회원 등록 API(2) - 파일 업로드 O
      // const file = null; // 파일이 있을 경우에만 처리
      // const response = await createMemberWithFile(memberData, file);

      console.log("회원 등록 성공 - response: ", response);
      alert("회원이 성공적으로 등록되었습니다.");
      route.push("/admin/members");
    } catch (error) {
      console.error("회원 등록 중 오류 발생:", error);
      alert("회원 등록에 실패했습니다. 다시 시도해주세요.");
    }
  }

  return (
    <InputFormLayout
      title="▹ 회원 등록"
      onSubmit={handleSubmit}
      isLoading={false}
    >
      {/* 회원 생성 페이지 - 회원 유형 선택*/}
      <Box>
        <Flex direction="row" align="center" mb={4}>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#4A5568",
            }}
          >
            회원 유형을 선택하세요
          </span>
          <span
            style={{ color: "red", marginLeft: "4px", marginRight: "24px" }}
          >
            *
          </span>
          <RadioGroup
            value={inputValues.role}
            onValueChange={(e) => handleInputChange("role", e.value)}
          >
            <HStack gap={6}>
              <Radio value="MEMBER">일반 회원</Radio>
              <Radio value="ADMIN">관리자</Radio>
            </HStack>
          </RadioGroup>
        </Flex>
      </Box>
      {/* 회원 생성 페이지 - 회원 정보 입력*/}

      <SelectedOrganization
        organizations={organizations}
        selectedOrganization={selectedOrganization}
        setSelectedOrganization={setSelectedOrganization}
      />
      <InputForm
        id="name"
        type="text"
        label="성함"
        placeholder="ex) 주농퐉"
        value={inputValues.name}
        error={inputErrors.name}
        onChange={(e) => handleInputChange("name", e.target.value)}
      />
      <InputForm
        id="email"
        type="email"
        label="로그인 Email"
        placeholder="ex) user@example.com"
        value={inputValues.email}
        error={inputErrors.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
      />
      <InputForm
        id="password"
        type="password"
        label="로그인 Password"
        placeholder="ex) 1234"
        value={inputValues.password}
        error={inputErrors.password}
        onChange={(e) => handleInputChange("password", e.target.value)}
      />
      <InputForm
        id="phoneNum"
        type="tel"
        label="연락처"
        placeholder="ex) 010-1234-5678"
        value={inputValues.phoneNum}
        error={inputErrors.phoneNum}
        onChange={(e) => handleChange("phoneNum", e.target.value)}
      />
      <InputForm
        id="jobRole"
        type="text"
        label="직무"
        placeholder="ex) 개발자"
        value={inputValues.jobRole}
        error={inputErrors.jobRole}
        onChange={(e) => handleInputChange("jobRole", e.target.value)}
      />
      <InputForm
        id="jobTitle"
        type="text"
        label="직함"
        placeholder="ex) 팀장"
        value={inputValues.jobTitle}
        error={inputErrors.jobTitle}
        onChange={(e) => handleInputChange("jobTitle", e.target.value)}
      />
      <InputForm
        id="introduction"
        type="text"
        label="회원 소개"
        placeholder="회원 소개글을 작성해주세요."
        value={inputValues.introduction}
        error={inputErrors.introduction}
        onChange={(e) => handleInputChange("introduction", e.target.value)}
      />
      <InputForm
        id="remark"
        type="text"
        label="특이사항"
        placeholder="회원 특이사항이 있다면 작성해주세요."
        value={inputValues.remark}
        error={inputErrors.remark}
        onChange={(e) => handleInputChange("remark", e.target.value)}
      />
    </InputFormLayout>
  );
}
