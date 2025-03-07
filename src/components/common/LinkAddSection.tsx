import { useState } from "react";
import { Box, Text, Button, Flex, Input } from "@chakra-ui/react";
import { showToast } from "@/src/utils/showToast";

interface LinkProps {
  name: string;
  url: string;
}

interface LinkAddSectionProps {
  linkList: LinkProps[];
  setLinkList: React.Dispatch<React.SetStateAction<LinkProps[]>>;
}

export default function LinkAddSection({
  linkList,
  setLinkList,
}: LinkAddSectionProps) {
  const [newLink, setNewLink] = useState<string>("");
  const [newLinkName, setNewLinkName] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // 링크 추가
  const handleAddLink = async () => {
    if (!newLink || !newLinkName) {
      const errorMessage = "링크와 이름을 입력하세요.";
      showToast({
        title: "요청 실패",
        description: errorMessage,
        type: "error",
        duration: 3000,
        error: errorMessage,
      });

      return;
    }

    setIsChecking(true);
    const isValid = await checkURLExists(newLink);
    setIsChecking(false);

    if (!isValid) {
      const errorMessage = "존재하지 않는 URL 입니다.";
      showToast({
        title: "요청 실패",
        description: errorMessage,
        type: "error",
        duration: 3000,
        error: errorMessage,
      });
      return;
    }

    if (newLink && newLinkName) {
      setLinkList((prev) => [...prev, { name: newLinkName, url: newLink }]);
    }
    setNewLink("");
    setNewLinkName("");
  };

  // 링크 삭제
  const handleRemoveLink = (index: number) => {
    const updatedLinks = linkList.filter((_, i) => i !== index);
    setLinkList(updatedLinks);
  };

  const checkURLExists = async (url: string) => {
    try {
      const formattedURL =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `https://${url}`;

      new URL(formattedURL);

      const response = await fetch(formattedURL, {
        method: "HEAD",
        mode: "no-cors",
      });

      if (response && response.type === "opaque") {
        return true;
      }
      return response.ok;
    } catch (error: any) {
      if (error.message.includes("Failed to fetch")) {
        return false;
      }
      return false;
    }
  };

  // checkURLExists("na22ver.com");

  return (
    <Box>
      <Text>링크 입력</Text>
      {linkList.map((link, index) => (
        <Flex key={index} mb={2}>
          <Text>
            {link.name} ({link.url})
          </Text>
          <Button
            ml={4}
            backgroundColor={"red.400"}
            _hover={{ backgroundColor: "red.500" }}
            color={"white"}
            size={"sm"}
            onClick={() => handleRemoveLink(index)}
          >
            삭제
          </Button>
        </Flex>
      ))}

      <Flex gap={2} mt={4}>
        <Input
          placeholder="링크(URL)를 입력하세요"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
        />
        <Input
          placeholder="링크 이름(별명)을 입력하세요"
          value={newLinkName}
          onChange={(e) => setNewLinkName(e.target.value)}
        />
        <Button
          backgroundColor={"#00a8ff"}
          _hover={{ backgroundColor: "#0095ff" }}
          color={"white"}
          loading={isChecking}
          onClick={handleAddLink}
        >
          추가
        </Button>
      </Flex>
    </Box>
  );
}
