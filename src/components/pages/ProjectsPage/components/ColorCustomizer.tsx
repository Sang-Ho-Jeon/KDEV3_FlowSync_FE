"use client";

import { Button } from "@chakra-ui/react";
import { Palette } from "lucide-react";
import ColorPickerModal from "@/src/components/pages/ProjectsPage/components/ColorPickerModal";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseTrigger,
  DialogBody,
} from "@/src/components/ui/dialog";

export default function ColorCustomizer() {
  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          _hover={{ bg: "#00a8ff", color: "white" }}
        >
          <Palette />
        </Button>
      </DialogTrigger>

      <DialogContent width="500px" height="auto" maxWidth="90vw">
        <DialogHeader>
          <DialogTitle>관리단계 색상 변경</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <ColorPickerModal />
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
