import { useEffect, useState } from "react";
import { Card, Layout, Page, Text, TextContainer } from "@shopify/polaris";
import styled from "styled-components";

import { Task } from "@Tasks/common/types";

import { OffersSection } from "./OffersSection";
import { getTasksOfCustomerQuery } from "../api";

export const TaskCard = ({ task }: { task: Task }) => {
  const { location } = task;

  return (
    <Layout.Section>
      <article aria-label="Task Card">
        <Card sectioned>
          <Card.Header title={task.title}></Card.Header>
          <Card.Section
            title={
              <Text as="h3" variant="headingMd">
                Details
              </Text>
            }
          >
            <TextContainer spacing="tight">
              <Text as="h3" variant="headingSm">
                ${task.budget}
              </Text>
              <Text as="p" variant="bodyMd">
                {task.category}
              </Text>
              <Text as="p" variant="bodyMd">
                {task.details}
              </Text>
              <Text as="p" variant="bodyMd">
                {location.line1} {location.line2}, {location.city}{" "}
                {location.state} {location.postal_code}
              </Text>
            </TextContainer>
          </Card.Section>
          <OffersSection task={task} />
        </Card>
      </article>
    </Layout.Section>
  );
};

/**
 * Hides the heading checkbox in the IndexTable
 */
const StyledDiv = styled.div`
  .Polaris-IndexTable__ColumnHeaderCheckboxWrapper {
    display: none;
  }
`;

export const TasksPage = ({
  status,
}: {
  status: "authenticated" | "loading" | "unauthenticated";
}) => {
  const [currentPage, setCurrentPage]: any = useState(1);
  const [tasks, setTasks] = useState(Array<Task>);

  function getTasks(currentPage: number) {
    getTasksOfCustomerQuery()
      .then((response) => {
        if (response.data.data.tasks.length == 0) {
          setCurrentPage(currentPage - 1);
        } else {
          setTasks(response.data.data.tasks);
        }
      })
      .catch((error) => {
        if (error.response.data.message == "This page does not exist.") {
          setCurrentPage(currentPage - 1);
        }
      });
  }

  useEffect(() => {
    if (status === "loading") return;

    getTasks(currentPage);
  }, [currentPage, status]);

  return (
    <StyledDiv aria-label="Customer Tasks Page">
      <Page title="Tasks" fullWidth>
        <Layout>
          {tasks.map((item) => {
            return <TaskCard task={item} key={item.id} />;
          })}
        </Layout>
      </Page>
    </StyledDiv>
  );
};