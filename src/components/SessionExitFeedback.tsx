import { useCallback, useState } from "react";
import "@react-spectrum/s2/page.css";
import {
  ActionButton,
  Button,
  ButtonGroup,
  Card,
  CardPreview,
  Checkbox,
  CheckboxGroup,
  Content,
  Divider,
  Heading,
  Image,
  Provider,
  Text,
  TextArea,
} from "@react-spectrum/s2";
import CheckmarkCircle from "@react-spectrum/s2/icons/CheckmarkCircle";
import Star from "@react-spectrum/s2/icons/Star";
import StarFilled from "@react-spectrum/s2/icons/StarFilled";
import styles from "./SessionExitFeedback.module.css";

const RATING_LABELS = ["Poor", "Average", "Good", "Great", "Excellent"] as const;
export type RatingLabel = (typeof RATING_LABELS)[number];

const DEFAULT_PROBLEM_AREAS = [
  "Audio quality",
  "Video quality",
  "Screen share",
  "Connection",
  "Other",
] as const;

export type SessionExitFeedbackPayload = {
  ratingIndex: number;
  problemAreas: string[];
  details: string;
};

export type SessionExitFeedbackProps = {
  courseTitle?: string;
  heroImageSrc?: string;
  exitMessage?: string;
  problemAreaOptions?: readonly string[];
  onRejoin?: () => void;
  onViewCourse?: () => void;
  onSubmitFeedback?: (payload: SessionExitFeedbackPayload) => void;
};

export function SessionExitFeedback({
  courseTitle = "Introduction to Gen AI",
  heroImageSrc,
  exitMessage = "You have exited the session",
  problemAreaOptions = DEFAULT_PROBLEM_AREAS,
  onRejoin,
  onViewCourse,
  onSubmitFeedback,
}: SessionExitFeedbackProps) {
  const [ratingIndex, setRatingIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [problemAreas, setProblemAreas] = useState<string[]>([]);
  const [details, setDetails] = useState("");

  const isLowRating = ratingIndex !== null && ratingIndex <= 1;
  const showDetailForm = !submitted && isLowRating;

  const selectRating = useCallback(
    (i: number) => {
      if (ratingIndex !== null && ratingIndex <= 1 && i > 1) {
        setProblemAreas([]);
        setDetails("");
      }
      setRatingIndex(i);
    },
    [ratingIndex],
  );

  const handleSubmit = useCallback(() => {
    if (ratingIndex === null) return;
    onSubmitFeedback?.({
      ratingIndex,
      problemAreas: [...problemAreas],
      details: details.trim(),
    });
    setSubmitted(true);
  }, [ratingIndex, problemAreas, details, onSubmitFeedback]);

  return (
    <Provider colorScheme="light" background="layer-1">
      <Content UNSAFE_className={styles.cardWrap}>
        <Card size="L" variant="primary" UNSAFE_className={styles.card}>
          <CardPreview UNSAFE_className={styles.cardPreview}>
            {heroImageSrc ? (
              <Image src={heroImageSrc} alt="" UNSAFE_className={styles.heroImg} />
            ) : null}
          </CardPreview>

          <Content UNSAFE_className={styles.body}>
            <Content UNSAFE_className={styles.topBlock}>
              <Content UNSAFE_className={styles.titleRow}>
                <Heading level={2}>{courseTitle}</Heading>
                <Text>{exitMessage}</Text>
              </Content>
              <ButtonGroup UNSAFE_className={styles.actions}>
                <Button variant="secondary" fillStyle="outline" size="L" onPress={onRejoin}>
                  Rejoin
                </Button>
                <Button variant="secondary" fillStyle="fill" size="L" onPress={onViewCourse}>
                  View course page
                </Button>
              </ButtonGroup>
            </Content>

            {!submitted && (
              <>
                <Divider size="S" UNSAFE_className={styles.divider} />
                <Content UNSAFE_className={styles.rateSection}>
                  <Text UNSAFE_className={styles.rateTitle}>
                    Rate your audio &amp; video experience
                  </Text>
                  <Content UNSAFE_className={styles.starRow}>
                    <Content UNSAFE_className={styles.starGrid} role="group" aria-label="Experience rating">
                      {RATING_LABELS.map((label, i) => (
                        <Content key={label} UNSAFE_className={styles.starCell}>
                          <ActionButton
                            isQuiet
                            size="M"
                            aria-label={label}
                            onPress={() => selectRating(i)}
                          >
                            {ratingIndex !== null && i <= ratingIndex ? (
                              <StarFilled aria-hidden />
                            ) : (
                              <Star aria-hidden />
                            )}
                          </ActionButton>
                        </Content>
                      ))}
                      {RATING_LABELS.map((label, i) => (
                        <Content key={`rating-label-${label}`} UNSAFE_className={styles.starLabelCell}>
                          <Text
                            UNSAFE_className={
                              ratingIndex === null
                                ? `${styles.ratingLabel} ${styles.ratingLabelMuted}`
                                : ratingIndex === i
                                  ? styles.ratingLabel
                                  : styles.ratingLabelDim
                            }
                          >
                            {ratingIndex === i ? RATING_LABELS[i] : "\u00a0"}
                          </Text>
                        </Content>
                      ))}
                    </Content>
                  </Content>
                </Content>

                {showDetailForm && (
                  <>
                    <CheckboxGroup
                      label="Select areas that did not work for you"
                      value={problemAreas}
                      onChange={setProblemAreas}
                      orientation="horizontal"
                      UNSAFE_className={styles.checkboxGroup}
                    >
                      {problemAreaOptions.map((label) => (
                        <Checkbox key={label} value={label}>
                          {label}
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                    <Content UNSAFE_className={styles.formBlock}>
                      <TextArea
                        label="Additional feedback"
                        placeholder="Let us also know the specifics of what went wrong. . ."
                        value={details}
                        onChange={setDetails}
                        size="M"
                        rows={4}
                      />
                      <Button variant="accent" fillStyle="fill" size="L" onPress={handleSubmit}>
                        Submit
                      </Button>
                    </Content>
                  </>
                )}

                {!isLowRating && ratingIndex !== null && (
                  <Content UNSAFE_className={styles.formBlock}>
                    <Button variant="accent" fillStyle="fill" size="L" onPress={handleSubmit}>
                      Submit feedback
                    </Button>
                  </Content>
                )}
              </>
            )}

            {submitted && ratingIndex !== null && (
              <>
                <Divider size="S" UNSAFE_className={styles.divider} />
                <Content UNSAFE_className={styles.successStars} aria-hidden>
                  {RATING_LABELS.map((_, i) => (
                    <Content key={RATING_LABELS[i]} UNSAFE_className={styles.successStarWrap}>
                      {i <= ratingIndex ? (
                        <StarFilled aria-hidden />
                      ) : (
                        <Star aria-hidden />
                      )}
                    </Content>
                  ))}
                </Content>
                <Content UNSAFE_className={styles.successRow}>
                  <CheckmarkCircle aria-hidden />
                  <Text UNSAFE_className={styles.successText}>
                    Your feedback has been recorded
                  </Text>
                </Content>
              </>
            )}
          </Content>
        </Card>
      </Content>
    </Provider>
  );
}
