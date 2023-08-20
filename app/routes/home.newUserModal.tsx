import { useNavigate } from "@remix-run/react";
import { useState } from "react";

// components
import { Text, Flex, Heading, Button } from "@radix-ui/themes";
import { Modal } from "~/components/modal";

export default function newUserModal() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const hideModal = () => {
    setShowModal(false);
    navigate(`/home`);
  };
  return (
    <Modal
      isOpen={showModal}
      hideModal={hideModal}
      className="w-1/3 min-w-[350px] flex flex-col align-center"
    >
      <Heading size="5" weight="bold">
        Welcome to Kudos!
      </Heading>
      <Flex direction="column" className="mt-4">
        <Text as="div" size="2">
          Want to give a praise?
        </Text>
        <Text as="div" size="2">
          Please Sign Up or Login to give a praise!
        </Text>
      </Flex>
      <Flex gap="4" justify="center" className="mt-4">
        <Button color="green" onClick={() => navigate("/login")}>
          Login
        </Button>
        <Button color="blue" onClick={() => navigate("/login?action=register")}>
          Sign Up
        </Button>
      </Flex>
    </Modal>
  );
}
