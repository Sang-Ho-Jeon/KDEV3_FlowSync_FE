// questionId 글 열람 페이지
"use client";

// 외부 라이브러리
import { Box, Flex } from "@chakra-ui/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

// 절대 경로 파일
import BackButton from "@/src/components/common/BackButton";
import NoticeArticleContent from "@/src/components/common/NoticeArticleContent";
import { useReadNotice } from "@/src/hook/useFetchData";
import { Loading } from "@/src/components/common/Loading";
import ErrorAlert from "@/src/components/common/ErrorAlert";
import DropDownMenu from "@/src/components/common/DropDownMenu";
import { useDeleteNotice } from "@/src/hook/useMutationData";

export default function NoticePage() {
  const { noticeId } = useParams() as {
    noticeId: string;
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams?.get("currentPage") || "1"; // 🔹 현재 페이지 값 읽기

  const {
    data: noticeArticle,
    loading: noticeLoading,
    error: noticeError,
  } = useReadNotice(noticeId);

  const { mutate: deleteNotice } = useDeleteNotice();

  if (noticeLoading) {
    return <Loading />; // ✅ 공통 로딩 컴포넌트 사용
  }

  const handleEdit = () => {
    router.push(`/notices/${noticeId}/edit?${searchParams.toString()}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmDelete) return;
    try {
      await deleteNotice(noticeId);
      alert("공지사항이 삭제되었습니다.");
      router.push(`/notices?currentPage=${currentPage}`);
    } catch (error) {
      alert(`삭제 중 문제가 발생했습니다 : ${error}`);
    }
  };

  return (
    <Box
      maxW="1000px"
      w="100%"
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <Flex justifyContent="space-between">
        <BackButton />
        <DropDownMenu onEdit={handleEdit} onDelete={handleDelete} />
      </Flex>

      {noticeError && (
        <ErrorAlert message="공지사항 조회에 실패했습니다. 다시 시도해주세요." />
      )}
      {/* 게시글 내용 */}
      <NoticeArticleContent article={noticeArticle} />
    </Box>
  );
}
