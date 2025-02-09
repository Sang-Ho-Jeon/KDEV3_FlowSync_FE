// question 글 작성 페이지

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box } from "@chakra-ui/react";
import BackButton from "@/src/components/common/BackButton";
import ArticleForm from "@/src/components/common/ArticleForm";
import { createQuestionApi } from "@/src/api/RegisterArticle";
import { QuestionRequestData } from "@/src/types";
import { useProjectApprovalProgressStepData } from "@/src/hook/useFetchData";
import FormSelectInput from "@/src/components/common/FormSelectInput";
import "@/src/components/pages/ProjectQuestionsNewPage/edit.css";
import ErrorAlert from "@/src/components/common/ErrorAlert";
import { Loading } from "@/src/components/common/Loading";

export default function ProjectQuestionsNewPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState<string>("");

  const resolvedProjectId = Array.isArray(projectId)
    ? projectId[0]
    : projectId || "";

  // ProgressStep 데이터 패칭
  const {
    data: approvalProgressStepData,
    loading: approvalProgressStepLoading,
    error: approvalProgressStepError,
  } = useProjectApprovalProgressStepData(resolvedProjectId);

  // "ALL" 값을 가진 객체 제외
  const filteredProgressSteps =
    approvalProgressStepData?.filter((step) => step.value !== "ALL") || [];

  const [progressStepId, setProgressStepId] = useState<number>(
    filteredProgressSteps.length > 0 ? Number(filteredProgressSteps[0].id) : 0,
  );

  const handleSave = async <T extends QuestionRequestData>(requestData: T) => {
    try {
      const response = await createQuestionApi(Number(projectId), {
        ...requestData,
        ...(requestData.progressStepId !== undefined
          ? { progressStepId: requestData.progressStepId }
          : {}),
      });
      // alert("저장이 완료되었습니다.");
      router.push(`/projects/${projectId}/questions`);
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 문제가 발생했습니다.");
    }
  };

  if (approvalProgressStepLoading) return <Loading />;

  return (
    <Box
      maxW="1000px"
      w={"100%"}
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <BackButton />

      <ArticleForm title={title} setTitle={setTitle} handleSave={handleSave}>
        {approvalProgressStepError && (
          <ErrorAlert message="프로젝트 질문 목록을 불러오지 못했습니다. 다시 시도해주세요." />
        )}
        <FormSelectInput
          label="진행 단계"
          selectedValue={progressStepId}
          setSelectedValue={setProgressStepId}
          options={filteredProgressSteps || []}
        />
      </ArticleForm>
    </Box>
  );
}
