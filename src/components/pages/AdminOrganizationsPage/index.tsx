"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  createListCollection,
  Flex,
  Heading,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { CircleAlert } from "lucide-react";
import { Switch } from "@/src/components/ui/switch";
import CommonTable from "@/src/components/common/CommonTable";
import Pagination from "@/src/components/common/Pagination";
import SearchSection from "@/src/components/common/SearchSection";
import FilterSelectBox from "@/src/components/common/FilterSelectBox";
import ErrorAlert from "@/src/components/common/ErrorAlert";
import DropDownMenu from "@/src/components/common/DropDownMenu";
import CreateButton from "@/src/components/common/CreateButton";
import {
  useDeleteOrganization,
  useUpdateOrganizationStatus,
} from "@/src/hook/useMutationData";
import { useOrganizationList } from "@/src/hook/useFetchBoardList";
import { Tooltip } from "@/src/components/ui/tooltip";

const organizationTypeFramework = createListCollection<{
  label: string;
  value: string;
}>({
  items: [
    { label: "전체", value: "" },
    { label: "고객사", value: "CUSTOMER" },
    { label: "개발사", value: "DEVELOPER" },
  ],
});

const OrganizationStatusFramework = createListCollection<{
  label: string;
  value: string;
}>({
  items: [
    { label: "전체", value: "" },
    { label: "활성화", value: "ACTIVE" },
    { label: "비활성화", value: "INACTIVE" },
  ],
});

const TYPE_LABELS: Record<string, string> = {
  CUSTOMER: "고객사",
  DEVELOPER: "개발사",
};

export default function AdminOrganizationsPage() {
  return (
    <Suspense>
      <AdminOrganizationsPageContent />
    </Suspense>
  );
}

function AdminOrganizationsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const keyword = searchParams?.get("keyword") || "";
  const type = searchParams?.get("type") || "";
  const status = searchParams?.get("status") || "";
  const currentPage = parseInt(searchParams?.get("currentPage") || "1", 10);
  const pageSize = parseInt(searchParams?.get("pageSize") || "10", 10);

  const {
    data: organizationList,
    paginationInfo,
    loading: organizationListLoading,
    error: organizationListError,
    refetch,
  } = useOrganizationList(keyword, type, status, currentPage, pageSize);

  const [loadingId, setLoadingId] = useState<string | null>(null); // 특정 업체의 Switch 로딩 상태

  // 업체 상태 변경 훅
  const { mutate: updateOrganizationStatus } = useUpdateOrganizationStatus();
  const { mutate: deleteOrganization } = useDeleteOrganization();

  // 업체 상태 변경 핸들러
  const handleStatusChange = async (organizationId: string) => {
    setLoadingId(organizationId);
    try {
      await updateOrganizationStatus(organizationId);
      refetch();
    } finally {
      setLoadingId(null);
    }
  };

  // 신규등록 버튼 클릭 시 - 업체 등록 페이지로 이동
  const handleOrganizationCreateButton = () => {
    router.push("/admin/organizations/create");
  };

  // 페이지 변경 시 새로운 데이터를 가져오는 함수
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    // 쿼리스트링 업데이트
    params.set("currentPage", page.toString());
    // URL 업데이트
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (id: string) => {
    router.push(`/admin/organizations/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/organizations/${id}`);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmDelete) return;
    const response = await deleteOrganization(id, ""); // 탈퇴 사유 입력값 전달
    if (response === null) return;
    refetch();
  };

  return (
    <>
      <Stack width="full">
        <Heading size="2xl" color="gray.600">
          업체 관리
        </Heading>
        <Box display="flex" justifyContent="space-between">
          <CreateButton handleButton={handleOrganizationCreateButton} />
          <SearchSection keyword={keyword} placeholder="업체명 입력">
            <FilterSelectBox
              statusFramework={organizationTypeFramework}
              selectedValue={type}
              queryKey="type"
              placeholder="업체유형"
              width="120px"
            />
            <FilterSelectBox
              statusFramework={OrganizationStatusFramework}
              selectedValue={status}
              queryKey="status"
              placeholder="업체 상태"
              width="120px"
            />
          </SearchSection>
        </Box>
        {organizationListError && (
          <ErrorAlert message="업체 목록을 불러오지 못했습니다. 다시 시도해주세요." />
        )}
        <CommonTable
          colspan={9}
          skeletonCount={14}
          columnsWidth={
            <>
              <Table.Column htmlWidth="8%" />
              <Table.Column htmlWidth="12%" />
              <Table.Column htmlWidth="12%" />
              <Table.Column htmlWidth="12%" />
              <Table.Column htmlWidth="30%" />
              <Table.Column htmlWidth="12%" />
              <Table.Column htmlWidth="6%" />
              <Table.Column htmlWidth="6%" />
            </>
          }
          headerTitle={
            <Table.Row
              backgroundColor={"#eee"}
              css={{
                "& > th": { textAlign: "center", whiteSpace: "nowrap" },
              }}
            >
              <Table.ColumnHeader>업체유형</Table.ColumnHeader>
              <Table.ColumnHeader>업체명</Table.ColumnHeader>
              <Table.ColumnHeader>사업자등록번호</Table.ColumnHeader>
              <Table.ColumnHeader>연락처</Table.ColumnHeader>
              <Table.ColumnHeader>주소</Table.ColumnHeader>
              <Table.ColumnHeader>등록일</Table.ColumnHeader>
              <Table.ColumnHeader>
                <Flex alignItems="center" width="100%">
                  <Tooltip
                    content={"업체 상태 변경"}
                    contentProps={{
                      css: { "--tooltip-bg": "#00A8FF" },
                    }}
                    positioning={{ placement: "top" }}
                  >
                    <Flex
                      alignItems="center"
                      justifyContent="flex-end"
                      cursor="default"
                    >
                      상태 &nbsp; <CircleAlert size="0.9rem" />
                    </Flex>
                  </Tooltip>
                </Flex>
              </Table.ColumnHeader>
              <Table.ColumnHeader>관리</Table.ColumnHeader>
            </Table.Row>
          }
          data={organizationList ?? []}
          loading={organizationListLoading}
          renderRow={(organization) => (
            <Table.Row
              key={organization.id}
              onClick={() => handleRowClick(organization.id)}
              css={{
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f5f5f5" },
                "& > td": {
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            >
              <Table.Cell>{TYPE_LABELS[organization.type]}</Table.Cell>
              <Table.Cell>{organization.name}</Table.Cell>
              <Table.Cell>{organization.brNumber}</Table.Cell>
              <Table.Cell>{organization.phoneNumber}</Table.Cell>
              <Table.Cell>
                {`${organization.streetAddress} ${organization.detailAddress}`}
              </Table.Cell>
              <Table.Cell>
                {(organization.regAt ?? "-").split(" ")[0]}
              </Table.Cell>

              <Table.Cell onClick={(event) => event.stopPropagation()}>
                {organization.status === "DELETED" ? (
                  <Text color="red">삭제됨</Text>
                ) : (
                  <Switch
                    checked={organization.status === "ACTIVE"}
                    onChange={(event) => {
                      event.stopPropagation();
                      handleStatusChange(organization.id);
                    }}
                    disabled={loadingId === organization.id} // 상태 변경 시 로딩 적용
                  />
                )}
              </Table.Cell>
              <Table.Cell onClick={(event) => event.stopPropagation()}>
                <DropDownMenu
                  onEdit={() => handleEdit(organization.id)}
                  onDelete={() => handleDelete(organization.id)}
                />
              </Table.Cell>
            </Table.Row>
          )}
        />
        {paginationInfo && (
          <Pagination
            paginationInfo={paginationInfo}
            handlePageChange={handlePageChange}
          />
        )}
      </Stack>
    </>
  );
}
