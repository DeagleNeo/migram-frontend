"use client";

import React, { useState } from "react";
import {
  AddressElement,
  CardElement as CardElementPrimitive,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { StripeCardElement } from "@stripe/stripe-js";

import { Button, Card, Form, FormLayout, Layout } from "@shopify/polaris";
import styled from "styled-components";

import { CardElement } from "./CardElement";
import { useCreatePaymentIntent } from "./hooks";

interface CheckoutFormProps {
  isPageLoading: boolean;
  taskId: string;
}

const StyledStripeForm = styled.div`
  padding: 20px;
`;

export const CheckoutForm = ({ isPageLoading, taskId }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { clientSecret } = useCreatePaymentIntent(taskId, setIsLoading);
  const isStripeLoading = !stripe ? true : false;

  const disabled = isPageLoading || isLoading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const result = await stripe.confirmCardPayment(clientSecret as string, {
      payment_method: {
        card: elements.getElement(CardElementPrimitive) as StripeCardElement,
      },
    });

    if (result.error) {
      console.log(result.error.message);

      if (
        result.error?.type === "card_error" ||
        result.error?.type === "validation_error"
      ) {
        setMessage(result.error?.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
    } else {
      if (result.paymentIntent.status === "succeeded") {
        // Show a success message to your customer
        // There's a risk of the customer closing the window before callback
        // execution. Set up a webhook or plugin to listen for the
        // payment_intent.succeeded event that handles any business critical
        // post-payment actions.
        alert("Finalized Payment");
      }
    }

    setIsLoading(false);
  };

  return (
    <Layout.Section fullWidth>
      <Card title="Payment Details">
        <Form onSubmit={onSubmit}>
          <FormLayout>
            <StyledStripeForm>
              <AddressElement
                options={{ mode: "billing", allowedCountries: ["AU"] }}
              />
              <CardElement />
              {isStripeLoading ? null : (
                <Button primary submit disabled={disabled}>
                  Submit
                </Button>
              )}
            </StyledStripeForm>
          </FormLayout>
        </Form>
      </Card>
    </Layout.Section>
  );
};
