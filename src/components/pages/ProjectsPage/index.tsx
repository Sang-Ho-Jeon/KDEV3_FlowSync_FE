"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import {
  Box,
  createListCollection,
  Flex,
  Heading,
  Stack,
  Table,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/src/components/ui/color-mode";
import StatusTag from "@/src/components/common/StatusTag";
import ProjectStatusCards from "@/src/components/pages/ProjectsPage/components/ProjectsStatusCards";
import CommonTable from "@/src/components/common/CommonTable";
import Pagination from "@/src/components/common/Pagination";
import SearchSection from "@/src/components/common/SearchSection";
import ErrorAlert from "@/src/components/common/ErrorAlert";
import CreateButton from "@/src/components/common/CreateButton";
import FilterSelectBox from "@/src/components/common/FilterSelectBox";
import { formatDynamicDate } from "@/src/utils/formatDateUtil";
import { useUserInfo } from "@/src/hook/useFetchData";
import { useProjectList } from "@/src/hook/useFetchBoardList";

const projectStatusFramework = createListCollection<{
  label: string;
  value: string;
}>({
  items: [
    { label: "전체", value: "" },
    { label: "계약", value: "CONTRACT" },
    { label: "진행중", value: "IN_PROGRESS" },
    { label: "납품완료", value: "COMPLETED" },
    { label: "하자보수", value: "MAINTENANCE" },
    { label: "일시중단", value: "PAUSED" },
    { label: "삭제", value: "DELETED" },
  ],
});

const STATUS_LABELS: Record<string, string> = {
  CONTRACT: "계약",
  IN_PROGRESS: "진행중",
  COMPLETED: "납품완료",
  MAINTENANCE: "하자보수",
  PAUSED: "일시중단",
  DELETED: "삭제",
};

/*
 * 페이지 기본 Export
 * useSearchParams() 훅 사용을 위해 Suspense로 감쌈
 */
export default function ProjectsPage() {
  return (
    <Suspense>
      <ProjectsPageContent />
    </Suspense>
  );
}

/*
 * 실질적인 콘텐츠를 렌더링하는 컴포넌트:
 * - 프로젝트 목록, 검색 섹션, 프로젝트 현황 카드, 페이지네이션 등을 표시
 */
function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const keyword = searchParams?.get("keyword") || "";
  const status = searchParams?.get("status") || "";
  const currentPage = parseInt(searchParams?.get("currentPage") || "1", 10);
  const pageSize = parseInt(searchParams?.get("pageSize") || "5", 10);

  const {
    data: projectList,
    paginationInfo,
    loading: projectListLoading,
    error: projectListError,
  } = useProjectList(keyword, status, currentPage, pageSize);

  // 현재 로그인 한 사용자 정보
  const { data: loggedInUserInfo } = useUserInfo();
  const userRole = loggedInUserInfo?.role; // 기본값 설정

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  /**
   * 페이지 변경 시 호출되는 콜백 함수
   * - 쿼리 파라미터를 갱신하고, fetchProjectList를 다시 호출합니다.
   *
   * @param page 새로 이동할 페이지 번호
   */
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    // 쿼리스트링 업데이트
    params.set("currentPage", page.toString());
    // URL 업데이트
    router.push(`?${params.toString()}`);
  };

  /**
   * 테이블 행 클릭 시 호출되는 콜백
   * - 특정 프로젝트의 상세 화면(/projects/[id]/tasks)로 이동
   *
   * @param id 프로젝트 ID (백엔드 혹은 테이블에서 받아온 값)
   */
  const handleRowClick = (id: string) => {
    router.push(`/projects/${id}/approvals`);
  };

  // 신규등록 버튼 클릭 시 - 공지사항 등록 페이지로 이동
  const handleProjectCreateButton = () => {
    router.push(`/projects/create`);
  };

  return (
    <>
      {/*
       * next/head:
       * HTML <head> 태그를 수정하기 위해 사용합니다.
       * SEO나 SNS 미리보기(OG 태그) 설정 등을 할 수 있습니다.
       */}
      <Head>
        <title>FlowSync</title>
        <meta property="og:image" content="@/public/FlowSyncLogo.jpg" />
        <meta property="og:title" content="FlowSync" />
        <meta
          property="og:description"
          content="FlowSync로 프로젝트 관리를 한번에"
        />
      </Head>

      <Box bg={bgColor} p="4" minHeight="100vh">
        <Stack spaceY="SECTION_SPACING">
          <ProjectStatusCards title={"프로젝트 현황"} />
          <Stack spaceY="SECTION_SPACING" width="full">
            <Heading size="2xl" color={textColor} lineHeight="base">
              프로젝트 목록
            </Heading>
            {userRole === "ADMIN" ? (
              <Flex justifyContent="space-between" alignItems="center">
                <CreateButton handleButton={handleProjectCreateButton} />
                {/* 프로젝트 검색/필터 섹션 (검색창, 필터 옵션 등) */}
                <SearchSection keyword={keyword} placeholder="제목 입력">
                  <FilterSelectBox
                    statusFramework={projectStatusFramework}
                    selectedValue={status}
                    queryKey="status"
                  />
                </SearchSection>
              </Flex>
            ) : (
              <Flex justifyContent="end">
                {/* 프로젝트 검색/필터 섹션 (검색창, 필터 옵션 등) */}
                <SearchSection keyword={keyword} placeholder="프로젝트명 입력">
                  <FilterSelectBox
                    statusFramework={projectStatusFramework}
                    selectedValue={status}
                    queryKey="status"
                  />
                </SearchSection>
              </Flex>
            )}

            {projectListError && (
              <ErrorAlert message="프로젝트 목록을 불러오지 못했습니다. 다시 시도해주세요." />
            )}
            {/*
             * 공통 테이블(CommonTable)
             *  - headerTitle: 테이블 헤더 구성
             *  - data: 테이블에 표시될 데이터
             *  - loading: 로딩 상태
             *  - renderRow: 한 줄씩 어떻게 렌더링할지 정의 (jsx 반환)
             *  - handleRowClick: 행 클릭 이벤트 핸들러
             */}

            <CommonTable
              headerTitle={
                <Table.Row
                  backgroundColor={useColorModeValue("#eee", "gray.700")}
                  css={{
                    "& > th": { textAlign: "center" },
                  }}
                >
                  <Table.ColumnHeader>프로젝트명</Table.ColumnHeader>
                  <Table.ColumnHeader>고객사</Table.ColumnHeader>
                  <Table.ColumnHeader>개발사</Table.ColumnHeader>
                  <Table.ColumnHeader>프로젝트 관리단계</Table.ColumnHeader>
                  <Table.ColumnHeader>프로젝트 시작일</Table.ColumnHeader>
                  <Table.ColumnHeader>프로젝트 종료일</Table.ColumnHeader>
                </Table.Row>
              }
              data={projectList}
              loading={projectListLoading}
              renderRow={(project) => (
                <>
                  <Table.Cell>{project.name}</Table.Cell>
                  <Table.Cell>{project.customerName}</Table.Cell>
                  <Table.Cell>{project.developerName}</Table.Cell>
                  <Table.Cell>
                    <StatusTag>
                      {STATUS_LABELS[project.status] || "알 수 없음"}
                    </StatusTag>
                  </Table.Cell>
                  <Table.Cell>{formatDynamicDate(project.startAt)}</Table.Cell>
                  <Table.Cell>{formatDynamicDate(project.closeAt)}</Table.Cell>
                </>
              )}
              handleRowClick={handleRowClick}
              placeholderHeight="300px" // 자리 표시자 높이
            />
            {/*
             * 페이지네이션 컴포넌트
             * paginationInfo: 현재 페이지, 총 페이지, 페이지 크기 등의 정보
             * handlePageChange: 페이지 이동 시 실행될 콜백
             */}
            <Pagination
              paginationInfo={
                paginationInfo && {
                  ...paginationInfo,
                  currentPage: paginationInfo.currentPage,
                }
              }
              handlePageChange={handlePageChange}
            />
          </Stack>
        </Stack>
      </Box>
    </>
  );
}
