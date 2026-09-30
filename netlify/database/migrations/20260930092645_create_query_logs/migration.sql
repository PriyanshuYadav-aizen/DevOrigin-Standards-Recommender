CREATE TABLE "query_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "query_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"input_text" text NOT NULL,
	"matched_standards" text[] DEFAULT '{}'::text[] NOT NULL,
	"confidence_score" double precision NOT NULL,
	"reasoning" text NOT NULL,
	"certification_flags" text[] DEFAULT '{}'::text[] NOT NULL,
	"needs_review" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
