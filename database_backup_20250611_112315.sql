--
-- PostgreSQL database dump
--

\restrict fQ1EqCy4OMCQvKTr6sOkObj09ywq6zjnxsqIKzkVfDWpvMT9Dm0MEdJe9gEVOm2

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: hyper
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO hyper;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: hyper
--

CREATE TABLE public.activity_logs (
    id bigint NOT NULL,
    user_id bigint,
    branch_id bigint,
    action character varying(255) NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id bigint,
    details text,
    ip_address character varying(255),
    user_agent text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.activity_logs OWNER TO hyper;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: hyper
--

CREATE SEQUENCE public.activity_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO hyper;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hyper
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: alerts; Type: TABLE; Schema: public; Owner: hyper
--

CREATE TABLE public.alerts (
    id bigint NOT NULL,
    device_id bigint NOT NULL,
    type character varying(255),
    severity character varying(255) DEFAULT 'medium'::character varying NOT NULL,
    category character varying(255) NOT NULL,
    title character varying(255),
    message text,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    acknowledged boolean DEFAULT false NOT NULL,
    triggered_at timestamp(0) without time zone NOT NULL,
    acknowledged_at timestamp(0) without time zone,
    acknowledged_by character varying(255),
    reason text,
    downtime character varying(255),
    resolved boolean DEFAULT false NOT NULL,
    resolved_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.alerts OWNER TO hyper;

--
-- Name: alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: hyper
--

CREATE SEQUENCE public.alerts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerts_id_seq OWNER TO hyper;

--
-- Name: alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hyper
--

ALTER SEQUENCE public.alerts_id_seq OWNED BY public.alerts.id;


--
-- Name: branches; Type: TABLE; Schema: public; Owner: hyper
--

CREATE TABLE public.branches (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    description character varying(255),
    address character varying(255),
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.branches OWNER TO hyper;

--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: hyper
--

CREATE SEQUENCE public.branches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branches_id_seq OWNER TO hyper;

--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hyper
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: hyper
--

CREATE TABLE public.brands (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.brands OWNER TO hyper;

--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: hyper
--

CREATE SEQUENCE public.brands_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brands_id_seq OWNER TO hyper;

--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hyper
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: devices; Type: TABLE; Schema: public; Owner: hyper
--

CREATE TABLE public.devices (
    id bigint NOT NULL,
    branch_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    ip_address character varying(255) NOT NULL,
    mac_address character varying(255),
    barcode character varying(255) NOT NULL,
    category character varying(255) DEFAULT 'switches'::character varying NOT NULL,
    status character varying(255) DEFAULT 'offline'::character varying NOT NULL,
    building character varying(255),
    uptime_percentage numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    response_time numeric(8,2),
    is_active boolean DEFAULT true NOT NULL,
    last_ping timestamp(0) without time zone,
    offline_reason text,
    offline_acknowledged_by character varying(255),
    offline_acknowledged_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    brand character varying(255),
    model character varying(255),
    location_id bigint,
    hardware_detail_id bigint,
    offline_since timestamp(0) without time zone,
    offline_duration_minutes numeric(10,2),
    offline_alert_sent boolean DEFAULT false NOT NULL
);


ALTER TABLE public.devices OWNER TO hyper;

--
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: hyper
--

CREATE SEQUENCE public.devices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.devices_id_seq OWNER TO hyper;

--
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hyper
--

ALTER SEQUENCE public.devices_id_seq OWNED BY public.devices.id;


--
-- Name: hardware_details; Type: TABLE; Schema: public; Owner: hyper
--

CREATE TABLE public.hardware_details (
    id bigint NOT NULL,
    brand_id bigint,
    model_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.hardware_details OWNER TO hyper;

--
-- Name: hardware_details_id_seq; Type: SEQUENCE; Schema: public; Owner: hyper
--

CREATE SEQUENCE public.hardware_details_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hardware_details_id_seq OWNER TO hyper;

--
-- Name: hardware_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hyper
--

ALTER SEQUENCE public.hardware_details_id_seq OWNED BY public.hardware_details.id;


--
-- Name: hardware_models; Type: TABLE; Schema: public; Owner: hyper
--

CREATE TABLE public.hardware_models (
    id bigint NOT NULL,
    brand_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.hardware_models OWNER TO hyper;

--
-- Name: hardware_models_id_seq; Type: SEQUENCE; Schema: public; Owner: hyper
--

CREATE SEQUENCE public.hardware_models_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hardware_models_id_seq OWNER TO hyper;

--
-- Name: hardware_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hyper
--

ALTER SEQUENCE public.hardware_models_id_seq OWNED BY public.hardware_models.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: hyper
--

CREATE TABLE public.locations (
    id bigint NOT NULL,
    branch_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.locations OWNER TO hyper;

--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: hyper
--

CREATE SEQUENCE public.locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.locations_id_seq OWNER TO hyper;

--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hyper
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: hyper
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO hyper;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: hyper
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO hyper;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hyper
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: monitoring_history; Type: TABLE; Schema: public; Owner: hyper
--

CREATE TABLE public.monitoring_history (
    id bigint NOT NULL,
    device_id bigint NOT NULL,
    status character varying(255) NOT NULL,
    response_time numeric(8,2),
    checked_at timestamp(0) without time zone NOT NULL,
    error_message text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.monitoring_history OWNER TO hyper;

--
-- Name: monitoring_history_id_seq; Type: SEQUENCE; Schema: public; Owner: hyper
--

CREATE SEQUENCE public.monitoring_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.monitoring_history_id_seq OWNER TO hyper;

--
-- Name: monitoring_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hyper
--

ALTER SEQUENCE public.monitoring_history_id_seq OWNED BY public.monitoring_history.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: hyper
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO hyper;

--
-- Name: users; Type: TABLE; Schema: public; Owner: hyper
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.users OWNER TO hyper;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: hyper
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO hyper;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hyper
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: alerts id; Type: DEFAULT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.alerts ALTER COLUMN id SET DEFAULT nextval('public.alerts_id_seq'::regclass);


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: devices id; Type: DEFAULT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.devices ALTER COLUMN id SET DEFAULT nextval('public.devices_id_seq'::regclass);


--
-- Name: hardware_details id; Type: DEFAULT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.hardware_details ALTER COLUMN id SET DEFAULT nextval('public.hardware_details_id_seq'::regclass);


--
-- Name: hardware_models id; Type: DEFAULT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.hardware_models ALTER COLUMN id SET DEFAULT nextval('public.hardware_models_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: monitoring_history id; Type: DEFAULT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.monitoring_history ALTER COLUMN id SET DEFAULT nextval('public.monitoring_history_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: hyper
--

COPY public.activity_logs (id, user_id, branch_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at, updated_at) FROM stdin;
1	\N	1	created	location	1	{"location_name":"A4"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 14:45:11	2025-11-05 14:45:11
2	\N	1	created	location	2	{"location_name":"A5"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 14:45:28	2025-11-05 14:45:28
3	\N	1	created	device	1	{"device_name":"A4"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 14:45:59	2025-11-05 14:45:59
4	\N	1	updated	device	1	{"device_name":"A4","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":3}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:10:08	2025-11-05 15:10:08
5	\N	1	updated	device	2	{"device_name":"A5","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"status":{"old":"offline","new":"online"},"location_id":{"old":3,"new":"2"},"hardware_detail_id":{"old":2,"new":4}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:10:27	2025-11-05 15:10:27
6	\N	1	updated	device	24	{"device_name":"SHIFT KESELAMATAN","changes":{"branch_id":{"old":7,"new":"1"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":5}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:11:30	2025-11-05 15:11:30
7	\N	1	updated	device	25	{"device_name":"ANPR Pos 1 Stadium 1","changes":{"branch_id":{"old":7,"new":"1"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":6}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:11:35	2025-11-05 15:11:35
9	\N	1	updated	device	26	{"device_name":"ANPR Pos 1 Stadium 2","changes":{"branch_id":{"old":7,"new":"1"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":7,"new":8}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:12:22	2025-11-05 15:12:22
10	\N	1	updated	device	27	{"device_name":"ANPR Pos 1 Stadium 3","changes":{"branch_id":{"old":7,"new":"1"},"location_id":{"old":3,"new":"2"},"hardware_detail_id":{"old":2,"new":9}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:12:37	2025-11-05 15:12:37
11	\N	1	updated	device	28	{"device_name":"ANPR Pos 1 Stadium 4","changes":{"branch_id":{"old":7,"new":"1"},"location_id":{"old":3,"new":"2"},"hardware_detail_id":{"old":2,"new":10}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:12:45	2025-11-05 15:12:45
12	\N	1	updated	device	29	{"device_name":"ANPR Pos Wakaf Gate 1","changes":{"branch_id":{"old":7,"new":"1"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":11}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:12:51	2025-11-05 15:12:51
13	\N	1	updated	device	30	{"device_name":"ANPR Pos Wakaf Gate 2","changes":{"branch_id":{"old":7,"new":"1"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":12}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:12:57	2025-11-05 15:12:57
14	\N	1	updated	device	3	{"device_name":"BCB","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":13}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:13:10	2025-11-05 15:13:10
15	\N	1	updated	device	4	{"device_name":"BENDAHARI","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":14}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:13:29	2025-11-05 15:13:29
16	\N	1	updated	device	5	{"device_name":"C16","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":15}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:13:46	2025-11-05 15:13:46
17	\N	1	updated	device	6	{"device_name":"D15 HEP","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":16}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:13:57	2025-11-05 15:13:57
18	\N	1	updated	device	7	{"device_name":"FKAAS","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":17}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:14:14	2025-11-05 15:14:14
19	\N	1	updated	device	9	{"device_name":"FKEE","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"2"},"hardware_detail_id":{"old":2,"new":18}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:14:26	2025-11-05 15:14:26
20	\N	1	updated	device	8	{"device_name":"FKMP","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":19}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:14:39	2025-11-05 15:14:39
21	\N	1	updated	device	10	{"device_name":"FPTP","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":20}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:14:49	2025-11-05 15:14:49
47	\N	1	created	location	5	{"location_name":"FSKTM"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:11:48	2025-11-06 02:11:48
48	\N	1	created	location	6	{"location_name":"FKEE"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:12:03	2025-11-06 02:12:03
22	\N	1	updated	device	11	{"device_name":"FPTV","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"2"},"hardware_detail_id":{"old":2,"new":21}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:14:58	2025-11-05 15:14:58
23	\N	1	updated	device	12	{"device_name":"FSKTM","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"2"},"hardware_detail_id":{"old":2,"new":22}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:15:11	2025-11-05 15:15:11
24	\N	1	updated	device	13	{"device_name":"LIBRARY","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":23}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:15:20	2025-11-05 15:15:20
25	\N	1	updated	device	14	{"device_name":"MASJID","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":24}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:15:28	2025-11-05 15:15:28
27	\N	1	updated	device	15	{"device_name":"PENDAFTAR","changes":{"branch_id":{"old":7,"new":"1"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":25,"new":26}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:15:58	2025-11-05 15:15:58
28	\N	1	updated	device	16	{"device_name":"PENGAWAL","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"2"},"hardware_detail_id":{"old":2,"new":27}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:16:09	2025-11-05 15:16:09
30	\N	1	updated	device	17	{"device_name":"PERWIRA","changes":{"branch_id":{"old":7,"new":"1"},"location_id":{"old":3,"new":"2"},"hardware_detail_id":{"old":28,"new":29}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:16:26	2025-11-05 15:16:26
31	\N	1	updated	device	18	{"device_name":"PHUI","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":30}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:16:38	2025-11-05 15:16:38
32	\N	1	updated	device	19	{"device_name":"PKU","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":31}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:17:12	2025-11-05 15:17:12
33	\N	1	updated	device	20	{"device_name":"PPA","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"2"},"hardware_detail_id":{"old":2,"new":32}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:17:21	2025-11-05 15:17:21
34	\N	1	updated	device	21	{"device_name":"PPP","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":33}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:17:30	2025-11-05 15:17:30
35	\N	1	updated	device	22	{"device_name":"PPUK","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"2"},"hardware_detail_id":{"old":2,"new":34}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:19:55	2025-11-05 15:19:55
36	\N	1	updated	device	23	{"device_name":"PUMAS","changes":{"branch_id":{"old":7,"new":"1"},"category":{"old":"switches","new":"tas"},"location_id":{"old":3,"new":"1"},"hardware_detail_id":{"old":2,"new":35}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:20:02	2025-11-05 15:20:02
37	\N	1	updated	device	1	{"device_name":"A4","changes":{"status":{"old":"offline","new":"online"},"hardware_detail_id":{"old":3,"new":36}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:38:24	2025-11-05 15:38:24
38	\N	1	updated	device	1	{"device_name":"A4","changes":{"status":{"old":"offline","new":"online"},"hardware_detail_id":{"old":36,"new":37}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 15:47:07	2025-11-05 15:47:07
39	\N	1	updated	device	24	{"device_name":"SHIFT KESELAMATAN","changes":{"category":{"old":"switches","new":"tas"},"hardware_detail_id":{"old":5,"new":38}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-05 16:11:16	2025-11-05 16:11:16
40	\N	1	updated	device	10	{"device_name":"FPTP","changes":{"status":{"old":"offline","new":"offline_ack"},"offline_reason":{"old":null,"new":"Tidak lagi dipakai"}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 01:24:32	2025-11-06 01:24:32
41	\N	1	updated	device	4	{"device_name":"BENDAHARI","changes":{"status":{"old":"offline","new":"offline_ack"},"offline_reason":{"old":null,"new":"Tidak lagi dipakai"}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 01:36:54	2025-11-06 01:36:54
42	\N	\N	created	model	17	{"model_name":"TAS Device"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 01:39:13	2025-11-06 01:39:13
43	\N	\N	created	model	18	{"model_name":"CCTV Device"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 01:39:31	2025-11-06 01:39:31
44	\N	\N	created	model	19	{"model_name":"Wi-Fi Device"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 01:40:53	2025-11-06 01:40:53
45	\N	\N	created	model	20	{"model_name":"Server Device"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 01:41:18	2025-11-06 01:41:18
46	\N	1	created	location	4	{"location_name":"Pos Stadium"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:11:26	2025-11-06 02:11:26
49	\N	1	created	location	7	{"location_name":"FPTP"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:12:13	2025-11-06 02:12:13
50	\N	1	created	location	8	{"location_name":"FPTV"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:12:28	2025-11-06 02:12:28
51	\N	1	created	location	9	{"location_name":"FKAAB"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:12:38	2025-11-06 02:12:38
52	\N	1	created	location	10	{"location_name":"DSI"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:12:51	2025-11-06 02:12:51
53	\N	1	created	location	11	{"location_name":"Tunku Tun Aminah Library"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:13:29	2025-11-06 02:13:29
54	\N	1	created	location	12	{"location_name":"Masjid"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:13:40	2025-11-06 02:13:40
55	\N	1	created	location	13	{"location_name":"Pos Wakaf"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:14:23	2025-11-06 02:14:23
56	\N	1	updated	device	25	{"device_name":"ANPR Pos 1 Stadium 1","changes":{"location_id":{"old":1,"new":"4"},"hardware_detail_id":{"old":6,"new":39}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:24:43	2025-11-06 02:24:43
57	\N	1	updated	device	26	{"device_name":"ANPR Pos 1 Stadium 2","changes":{"location_id":{"old":1,"new":"4"},"hardware_detail_id":{"old":8,"new":40}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:24:51	2025-11-06 02:24:51
58	\N	1	updated	device	27	{"device_name":"ANPR Pos 1 Stadium 3","changes":{"location_id":{"old":2,"new":"4"},"hardware_detail_id":{"old":9,"new":41}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:24:57	2025-11-06 02:24:57
59	\N	1	updated	device	28	{"device_name":"ANPR Pos 1 Stadium 4","changes":{"location_id":{"old":2,"new":"4"},"hardware_detail_id":{"old":10,"new":42}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:25:01	2025-11-06 02:25:01
60	\N	1	updated	device	29	{"device_name":"ANPR Pos Wakaf Gate 1","changes":{"location_id":{"old":1,"new":"13"},"hardware_detail_id":{"old":11,"new":43}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:25:07	2025-11-06 02:25:07
61	\N	1	updated	device	30	{"device_name":"ANPR Pos Wakaf Gate 2","changes":{"location_id":{"old":1,"new":"13"},"hardware_detail_id":{"old":12,"new":44}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:25:12	2025-11-06 02:25:12
62	\N	1	updated	device	7	{"device_name":"FKAAS","changes":{"location_id":{"old":1,"new":"9"},"hardware_detail_id":{"old":17,"new":45}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:25:22	2025-11-06 02:25:22
63	\N	1	updated	device	9	{"device_name":"FKEE","changes":{"location_id":{"old":2,"new":"6"},"hardware_detail_id":{"old":18,"new":46}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:25:30	2025-11-06 02:25:30
64	\N	1	updated	device	10	{"device_name":"FPTP","changes":{"status":{"old":"offline_ack","new":"online"},"location_id":{"old":1,"new":"7"},"hardware_detail_id":{"old":20,"new":47}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:25:41	2025-11-06 02:25:41
65	\N	1	updated	device	11	{"device_name":"FPTV","changes":{"location_id":{"old":2,"new":"7"},"hardware_detail_id":{"old":21,"new":48}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:25:56	2025-11-06 02:25:56
66	\N	1	updated	device	11	{"device_name":"FPTV","changes":{"location_id":{"old":7,"new":"8"},"hardware_detail_id":{"old":48,"new":49}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:26:08	2025-11-06 02:26:08
67	\N	1	updated	device	10	{"device_name":"FPTP","changes":{"status":{"old":"offline","new":"offline_ack"},"offline_reason":{"old":null,"new":"Tidak dipakai"}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:33:36	2025-11-06 02:33:36
68	\N	1	updated	device	10	{"device_name":"FPTP","changes":{"status":{"old":"offline","new":"offline_ack"},"offline_reason":{"old":null,"new":"Tidak dipakai"}}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-06 02:33:37	2025-11-06 02:33:37
\.


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: hyper
--

COPY public.alerts (id, device_id, type, severity, category, title, message, status, acknowledged, triggered_at, acknowledged_at, acknowledged_by, reason, downtime, resolved, resolved_at, created_at, updated_at) FROM stdin;
37	28	offline	high	manual	Device Offline: ANPR Pos 1 Stadium 4	Device ANPR Pos 1 Stadium 4 (10.8.23.228) has been offline for 2 minutes.	acknowledged	t	2025-11-06 03:06:39	2025-11-06 03:13:44	Faiq	Device problem tapi masih okay	\N	t	2025-11-06 03:13:44	2025-11-06 03:06:39	2025-11-06 03:13:44
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: hyper
--

COPY public.branches (id, name, code, description, address, latitude, longitude, is_active, created_at, updated_at) FROM stdin;
1	UTHM Kampus Parit Raja	PR	Kampus Parit Raja	\N	1.85420000	103.08390000	t	2025-11-05 14:31:12	2025-11-05 14:43:00
2	UTHM Kampus Pagoh	PG	Kampus Pagoh	\N	2.14590000	102.76080000	t	2025-11-05 14:31:12	2025-11-05 14:43:53
3	UTHM Kampus Bandar	BR	Kampus Bandar	\N	1.85530000	102.93250000	t	2025-11-05 14:31:12	2025-11-05 14:44:11
4	UTHM Kampus Sungai Buloh	SB	Kampus Sungai Buloh	\N	1.85650000	103.08520000	t	2025-11-05 14:31:12	2025-11-05 14:44:29
5	UTHM Kampus Tanjong Laboh	TL	Kampus Tanjong Laboh	\N	1.85220000	103.08150000	t	2025-11-05 14:31:12	2025-11-05 14:44:49
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: hyper
--

COPY public.brands (id, name, description, created_at, updated_at) FROM stdin;
1	Cisco	Leading network equipment manufacturer	2025-11-05 14:31:12	2025-11-05 14:31:12
2	HP	Server and networking solutions	2025-11-05 14:31:12	2025-11-05 14:31:12
3	Ubiquiti	Wireless networking equipment	2025-11-05 14:31:12	2025-11-05 14:31:12
4	Hikvision	CCTV and surveillance systems	2025-11-05 14:31:12	2025-11-05 14:31:12
5	Dell	Enterprise server solutions	2025-11-05 14:31:12	2025-11-05 14:31:12
6	Generic	\N	2025-11-05 14:53:46	2025-11-05 14:53:46
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: hyper
--

COPY public.devices (id, branch_id, name, ip_address, mac_address, barcode, category, status, building, uptime_percentage, response_time, is_active, last_ping, offline_reason, offline_acknowledged_by, offline_acknowledged_at, created_at, updated_at, brand, model, location_id, hardware_detail_id, offline_since, offline_duration_minutes, offline_alert_sent) FROM stdin;
23	1	PUMAS	10.100.10.1	\N	TAS-10100101	tas	online	\N	100.00	15.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	1	35	\N	\N	f
6	1	D15 HEP	10.60.27.204	\N	TAS-106027204	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	1	16	\N	\N	f
16	1	PENGAWAL	10.8.23.224	\N	TAS-10823224	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	2	27	\N	\N	f
10	1	FPTP	10.68.23.201	\N	TAS-106823201	tas	offline_ack	\N	100.00	273.91	t	2025-11-06 02:33:36	Tidak dipakai	Faiq	2025-11-06 02:33:37	2025-11-05 14:55:46	2025-11-06 03:16:41	\N	\N	7	47	2025-11-06 02:26:01	7.59	t
25	1	ANPR Pos 1 Stadium 1	10.8.23.225	\N	ANPR-10823225	cctv	offline	\N	75.27	124.30	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	4	39	2025-11-06 03:22:39	0.00	f
27	1	ANPR Pos 1 Stadium 3	10.8.23.227	\N	ANPR-10823227	cctv	offline	\N	83.87	138.05	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	4	41	2025-11-06 03:22:39	0.00	f
28	1	ANPR Pos 1 Stadium 4	10.8.23.228	\N	ANPR-10823228	cctv	offline	\N	37.10	144.08	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	4	42	2025-11-06 03:22:39	0.00	f
3	1	BCB	10.9.159.202	\N	TAS-109159202	tas	online	\N	88.89	14.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	1	13	\N	\N	f
29	1	ANPR Pos Wakaf Gate 1	10.63.47.215	\N	ANPR-106347215	cctv	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	13	43	\N	\N	f
11	1	FPTV	10.66.23.216	\N	TAS-106623216	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	8	49	\N	\N	f
12	1	FSKTM	10.65.53.158	\N	TAS-106553158	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	2	22	\N	\N	f
18	1	PHUI	10.8.23.156	\N	TAS-10823156	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	1	30	\N	\N	f
20	1	PPA	10.60.34.140	\N	TAS-106034140	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	2	32	\N	\N	f
19	1	PKU	10.60.27.221	\N	TAS-106027221	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	1	31	\N	\N	f
4	1	BENDAHARI	10.60.27.205	\N	TAS-106027205	tas	offline_ack	\N	100.00	515.30	t	2025-11-06 01:36:51	Tidak lagi dipakai	Faiq	2025-11-06 01:36:54	2025-11-05 14:55:46	2025-11-06 03:16:41	\N	\N	1	14	2025-11-06 01:23:38	13.23	t
22	1	PPUK	10.60.33.67	\N	TAS-10603367	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	2	34	\N	\N	f
8	1	FKMP	10.69.23.201	\N	TAS-106923201	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	1	19	\N	\N	f
2	1	A5	10.8.27.222	\N	TAS-10827222	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	2	4	\N	\N	f
14	1	MASJID	10.63.47.209	\N	TAS-106347209	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	1	24	\N	\N	f
21	1	PPP	10.63.47.212	\N	TAS-106347212	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	1	33	\N	\N	f
1	1	A4	10.8.23.155	\N	TAS-10823155	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:45:59	2025-11-06 03:22:39	\N	\N	1	37	\N	\N	f
24	1	SHIFT KESELAMATAN	10.8.23.201	\N	TAS-10823201	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	1	38	\N	\N	f
26	1	ANPR Pos 1 Stadium 2	10.8.23.226	\N	ANPR-10823226	cctv	online	\N	100.00	38.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	4	40	\N	\N	f
13	1	LIBRARY	10.63.23.201	\N	TAS-106323201	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	1	23	\N	\N	f
5	1	C16	10.61.27.201	\N	TAS-106127201	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	1	15	\N	\N	f
30	1	ANPR Pos Wakaf Gate 2	10.63.47.216	\N	ANPR-106347216	cctv	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	13	44	\N	\N	f
17	1	PERWIRA	10.8.35.205	\N	TAS-10835205	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	2	29	\N	\N	f
15	1	PENDAFTAR	10.61.24.138	\N	TAS-106124138	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	1	26	\N	\N	f
7	1	FKAAS	10.67.23.222	\N	TAS-106723222	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	9	45	\N	\N	f
9	1	FKEE	10.61.68.7	\N	TAS-1061687	tas	online	\N	100.00	1.00	t	2025-11-06 03:22:39	\N	\N	\N	2025-11-05 14:55:46	2025-11-06 03:22:39	\N	\N	6	46	\N	\N	f
\.


--
-- Data for Name: hardware_details; Type: TABLE DATA; Schema: public; Owner: hyper
--

COPY public.hardware_details (id, brand_id, model_id, created_at, updated_at) FROM stdin;
1	3	9	2025-11-05 14:45:59	2025-11-05 14:45:59
2	6	16	2025-11-05 14:54:53	2025-11-05 14:54:53
3	6	16	2025-11-05 15:10:08	2025-11-05 15:10:08
4	6	16	2025-11-05 15:10:27	2025-11-05 15:10:27
5	6	16	2025-11-05 15:11:30	2025-11-05 15:11:30
6	6	16	2025-11-05 15:11:35	2025-11-05 15:11:35
7	6	16	2025-11-05 15:11:40	2025-11-05 15:11:40
8	6	16	2025-11-05 15:12:22	2025-11-05 15:12:22
9	6	16	2025-11-05 15:12:37	2025-11-05 15:12:37
10	6	16	2025-11-05 15:12:44	2025-11-05 15:12:44
11	6	16	2025-11-05 15:12:51	2025-11-05 15:12:51
12	6	16	2025-11-05 15:12:57	2025-11-05 15:12:57
13	6	16	2025-11-05 15:13:10	2025-11-05 15:13:10
14	6	16	2025-11-05 15:13:29	2025-11-05 15:13:29
15	6	16	2025-11-05 15:13:46	2025-11-05 15:13:46
16	6	16	2025-11-05 15:13:57	2025-11-05 15:13:57
17	6	16	2025-11-05 15:14:14	2025-11-05 15:14:14
18	6	16	2025-11-05 15:14:26	2025-11-05 15:14:26
19	6	16	2025-11-05 15:14:39	2025-11-05 15:14:39
20	6	16	2025-11-05 15:14:48	2025-11-05 15:14:48
21	6	16	2025-11-05 15:14:58	2025-11-05 15:14:58
22	6	16	2025-11-05 15:15:11	2025-11-05 15:15:11
23	6	16	2025-11-05 15:15:20	2025-11-05 15:15:20
24	6	16	2025-11-05 15:15:28	2025-11-05 15:15:28
25	6	16	2025-11-05 15:15:51	2025-11-05 15:15:51
26	6	16	2025-11-05 15:15:58	2025-11-05 15:15:58
27	6	16	2025-11-05 15:16:09	2025-11-05 15:16:09
28	6	16	2025-11-05 15:16:19	2025-11-05 15:16:19
29	6	16	2025-11-05 15:16:26	2025-11-05 15:16:26
30	6	16	2025-11-05 15:16:38	2025-11-05 15:16:38
31	6	16	2025-11-05 15:17:12	2025-11-05 15:17:12
32	6	16	2025-11-05 15:17:21	2025-11-05 15:17:21
33	6	16	2025-11-05 15:17:30	2025-11-05 15:17:30
34	6	16	2025-11-05 15:19:54	2025-11-05 15:19:54
35	6	16	2025-11-05 15:20:02	2025-11-05 15:20:02
36	6	16	2025-11-05 15:38:24	2025-11-05 15:38:24
37	6	16	2025-11-05 15:47:07	2025-11-05 15:47:07
38	6	16	2025-11-05 16:11:16	2025-11-05 16:11:16
39	6	16	2025-11-06 02:24:43	2025-11-06 02:24:43
40	6	16	2025-11-06 02:24:51	2025-11-06 02:24:51
41	6	16	2025-11-06 02:24:57	2025-11-06 02:24:57
42	6	16	2025-11-06 02:25:01	2025-11-06 02:25:01
43	6	16	2025-11-06 02:25:07	2025-11-06 02:25:07
44	6	16	2025-11-06 02:25:12	2025-11-06 02:25:12
45	6	16	2025-11-06 02:25:22	2025-11-06 02:25:22
46	6	16	2025-11-06 02:25:30	2025-11-06 02:25:30
47	6	16	2025-11-06 02:25:41	2025-11-06 02:25:41
48	6	16	2025-11-06 02:25:56	2025-11-06 02:25:56
49	6	16	2025-11-06 02:26:08	2025-11-06 02:26:08
\.


--
-- Data for Name: hardware_models; Type: TABLE DATA; Schema: public; Owner: hyper
--

COPY public.hardware_models (id, brand_id, name, description, created_at, updated_at) FROM stdin;
1	1	Catalyst 2960	Model: Catalyst 2960	2025-11-05 14:31:12	2025-11-05 14:31:12
2	1	Catalyst 3850	Model: Catalyst 3850	2025-11-05 14:31:12	2025-11-05 14:31:12
3	1	ASR 1000	Model: ASR 1000	2025-11-05 14:31:12	2025-11-05 14:31:12
4	2	ProLiant DL380	Model: ProLiant DL380	2025-11-05 14:31:12	2025-11-05 14:31:12
5	2	ProLiant DL360	Model: ProLiant DL360	2025-11-05 14:31:12	2025-11-05 14:31:12
6	2	OfficeConnect	Model: OfficeConnect	2025-11-05 14:31:12	2025-11-05 14:31:12
7	3	UniFi AP AC Pro	Model: UniFi AP AC Pro	2025-11-05 14:31:12	2025-11-05 14:31:12
8	3	UniFi Dream Machine	Model: UniFi Dream Machine	2025-11-05 14:31:12	2025-11-05 14:31:12
9	3	EdgeRouter	Model: EdgeRouter	2025-11-05 14:31:12	2025-11-05 14:31:12
10	4	DS-2CD2043G0-I	Model: DS-2CD2043G0-I	2025-11-05 14:31:12	2025-11-05 14:31:12
11	4	DS-7608NI-I2	Model: DS-7608NI-I2	2025-11-05 14:31:12	2025-11-05 14:31:12
12	4	DS-2DE4425IW-DE	Model: DS-2DE4425IW-DE	2025-11-05 14:31:12	2025-11-05 14:31:12
13	5	PowerEdge R740	Model: PowerEdge R740	2025-11-05 14:31:12	2025-11-05 14:31:12
14	5	PowerEdge R640	Model: PowerEdge R640	2025-11-05 14:31:12	2025-11-05 14:31:12
15	5	PowerEdge T340	Model: PowerEdge T340	2025-11-05 14:31:12	2025-11-05 14:31:12
16	6	Switch Device	Standard Switch Device	2025-11-05 14:54:23	2025-11-06 01:38:57
17	6	TAS Device	Standard TAS Device	2025-11-06 01:39:13	2025-11-06 01:39:13
18	6	CCTV Device	Standard CCTV Device	2025-11-06 01:39:31	2025-11-06 01:39:31
19	6	Wi-Fi Device	Standard Wi-Fi Device	2025-11-06 01:40:53	2025-11-06 01:40:53
20	6	Server Device	Standard Server Device	2025-11-06 01:41:18	2025-11-06 01:41:18
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: hyper
--

COPY public.locations (id, branch_id, name, description, latitude, longitude, created_at, updated_at) FROM stdin;
1	1	A4	\N	1.85435300	103.08783800	2025-11-05 14:45:11	2025-11-05 14:45:11
2	1	A5	\N	1.85430700	103.08830700	2025-11-05 14:45:28	2025-11-05 14:45:28
4	1	Pos Stadium	\N	1.85285000	103.08661700	2025-11-06 02:11:26	2025-11-06 02:11:26
5	1	FSKTM	\N	1.86027200	103.08429800	2025-11-06 02:11:48	2025-11-06 02:11:48
6	1	FKEE	\N	1.86177400	103.08559500	2025-11-06 02:12:03	2025-11-06 02:12:03
7	1	FPTP	\N	1.86123400	103.08212500	2025-11-06 02:12:13	2025-11-06 02:12:13
8	1	FPTV	\N	1.86265900	103.08245800	2025-11-06 02:12:28	2025-11-06 02:12:28
9	1	FKAAB	\N	1.86334100	103.08349200	2025-11-06 02:12:38	2025-11-06 02:12:38
10	1	DSI	\N	1.85783300	103.08030000	2025-11-06 02:12:51	2025-11-06 02:12:51
11	1	Tunku Tun Aminah Library	\N	1.85747200	103.08206000	2025-11-06 02:13:29	2025-11-06 02:13:29
12	1	Masjid	\N	1.85523700	103.08122900	2025-11-06 02:13:40	2025-11-06 02:13:40
13	1	Pos Wakaf	\N	1.85405000	103.07641700	2025-11-06 02:14:23	2025-11-06 02:14:23
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: hyper
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	2014_10_12_000000_create_users_table	1
2	2023_11_03_024123_create_brands_table	1
3	2024_01_01_000001_create_branches_table	1
4	2024_01_01_000002_create_devices_table	1
5	2024_01_01_000003_create_alerts_table	1
6	2024_01_01_000004_create_locations_table	1
7	2024_01_01_000004_create_monitoring_history_table	1
8	2024_01_01_000005_create_hardware_models_table	1
9	2024_01_01_000006_create_hardware_details_table	1
10	2024_01_01_000007_create_sessions_table	1
11	2024_01_15_000007_add_brand_model_to_devices_table	1
12	2024_11_04_000001_create_activity_logs_table	1
13	2025_01_01_000001_update_locations_add_branch_id	1
14	2025_01_01_000002_update_devices_add_location_id	1
15	2025_11_04_121333_change_response_time_to_decimal_in_devices_table	1
16	2025_11_04_122724_add_offline_tracking_to_devices_table	1
17	2025_11_04_142227_change_offline_duration_to_decimal_in_devices_table	1
\.


--
-- Data for Name: monitoring_history; Type: TABLE DATA; Schema: public; Owner: hyper
--

COPY public.monitoring_history (id, device_id, status, response_time, checked_at, error_message, created_at, updated_at) FROM stdin;
14328	28	offline	119.06	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14329	3	online	17.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14330	29	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14331	11	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14332	12	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14333	18	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14334	20	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14335	19	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14336	23	online	16.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14337	6	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14338	16	online	2.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14339	25	online	57.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14340	27	online	58.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14341	1	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14342	24	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14343	26	online	56.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14344	13	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14345	5	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14346	22	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14347	8	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14348	2	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14349	14	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14350	21	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14351	30	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14352	17	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14353	15	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14354	7	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14355	9	online	1.00	2025-11-06 03:17:23	\N	2025-11-06 03:17:23	2025-11-06 03:17:23
14356	28	offline	126.94	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14357	3	online	15.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14358	29	online	4.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14359	11	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14360	12	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14361	18	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14362	20	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14363	19	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14364	23	online	16.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14365	6	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14366	16	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14367	25	online	55.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14368	27	online	56.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14369	1	online	2.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14370	24	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14371	26	online	56.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14372	13	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14373	5	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14374	22	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14375	8	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14376	2	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14377	14	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14378	21	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14379	30	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14380	17	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14381	15	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14382	7	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14383	9	online	1.00	2025-11-06 03:17:53	\N	2025-11-06 03:17:53	2025-11-06 03:17:53
14384	28	online	61.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14385	3	online	14.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14386	29	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14387	11	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14388	12	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14389	18	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14390	20	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14391	19	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14392	23	online	15.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14393	6	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14394	16	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14395	25	offline	161.33	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14396	27	online	65.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14397	1	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14398	24	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14399	26	online	65.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14400	13	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14401	5	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14402	22	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14403	8	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14404	2	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14405	14	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14406	21	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14407	30	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14408	17	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14409	15	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14410	7	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14411	9	online	1.00	2025-11-06 03:18:23	\N	2025-11-06 03:18:23	2025-11-06 03:18:23
14412	28	offline	126.21	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14413	3	online	14.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14414	29	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14415	11	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14416	12	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14417	18	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14418	20	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14419	19	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14420	23	online	15.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14421	6	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14422	16	online	2.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14423	25	online	49.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14424	27	online	54.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14425	1	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14426	24	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14427	26	online	53.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14428	13	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14429	5	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14430	22	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14431	8	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14432	2	online	2.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14433	14	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14434	21	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14435	30	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14436	17	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14437	15	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14438	7	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14439	9	online	1.00	2025-11-06 03:18:53	\N	2025-11-06 03:18:53	2025-11-06 03:18:53
14440	28	offline	121.24	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14441	3	offline	136.92	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14442	29	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14443	11	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14444	12	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14445	18	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14446	20	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14447	19	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14448	23	online	15.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14449	6	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14450	16	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14451	25	online	49.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14452	27	online	43.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14453	1	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14454	24	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14455	26	online	52.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14456	13	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14457	5	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14458	22	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14459	8	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14460	2	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14461	14	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14462	21	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14463	30	online	3.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14464	17	online	10.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14465	15	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14466	7	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14467	9	online	1.00	2025-11-06 03:19:23	\N	2025-11-06 03:19:23	2025-11-06 03:19:23
14468	28	offline	111.83	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14469	3	online	14.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14470	29	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14471	11	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14472	12	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14473	18	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14474	20	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14475	19	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14476	23	online	14.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14477	6	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14478	16	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14479	25	online	44.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14480	27	online	40.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14481	1	online	3.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14482	24	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14483	26	online	43.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14484	13	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14485	5	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14486	22	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14487	8	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14488	2	online	2.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14489	14	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14490	21	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14491	30	online	11.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14492	17	online	19.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14493	15	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14494	7	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14495	9	online	1.00	2025-11-06 03:19:53	\N	2025-11-06 03:19:53	2025-11-06 03:19:53
14496	25	online	14.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14497	27	online	16.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14498	28	online	12.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14499	3	online	23.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14500	29	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14501	11	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14502	12	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14503	18	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14504	20	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14505	19	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14506	23	online	17.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14507	6	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14508	16	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14509	22	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14510	8	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14511	2	online	3.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14512	14	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14513	21	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14514	1	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14515	24	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14516	26	online	43.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14517	13	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14518	5	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14519	30	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14520	17	online	6.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14521	15	online	1.00	2025-11-06 03:20:39	\N	2025-11-06 03:20:39	2025-11-06 03:20:39
14522	7	online	1.00	2025-11-06 03:20:40	\N	2025-11-06 03:20:40	2025-11-06 03:20:40
14523	9	online	1.00	2025-11-06 03:20:40	\N	2025-11-06 03:20:40	2025-11-06 03:20:40
14524	25	online	36.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14525	27	online	40.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14526	28	online	33.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14527	3	online	14.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14528	29	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14529	11	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14530	12	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14531	18	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14532	20	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14533	19	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14534	23	online	15.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14535	6	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14536	16	online	2.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14537	22	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14538	8	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14539	2	online	2.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14540	14	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14541	21	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14542	1	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14543	24	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14544	26	online	41.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14545	13	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14546	5	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14547	30	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14548	17	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14549	15	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14550	7	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14551	9	online	1.00	2025-11-06 03:21:39	\N	2025-11-06 03:21:39	2025-11-06 03:21:39
14552	25	offline	124.30	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14553	27	offline	138.05	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14554	28	offline	144.08	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14555	3	online	14.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14556	29	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14557	11	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14558	12	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14559	18	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14560	20	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14561	19	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14562	23	online	15.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14563	6	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14564	16	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14565	22	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14566	8	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14567	2	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14568	14	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14569	21	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14570	1	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14571	24	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14572	26	online	38.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14573	13	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14574	5	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14575	30	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14576	17	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14577	15	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14578	7	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
14579	9	online	1.00	2025-11-06 03:22:39	\N	2025-11-06 03:22:39	2025-11-06 03:22:39
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: hyper
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
Tbc3DAc8wwMpcQjNaCWvvYN0fTr96hN5WNG7Rf8D	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	YTo0OntzOjY6Il90b2tlbiI7czo0MDoiZGwwc0tFd1NZNEF3bHlSWE1FUzFKaWs2YTZUYWZla2N4TUs2bTM1VCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDk6Imh0dHA6Ly9ob3N0bW9uaXRvcnY2LnRlc3QvYXBpL2RldmljZXM/YnJhbmNoX2lkPTEiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6MTc6ImN1cnJlbnRfYnJhbmNoX2lkIjtzOjE6IjEiO30=	1762399360
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: hyper
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at) FROM stdin;
1	Administrator	admin@hostmonitor.local	2025-11-05 14:31:13	$2y$12$hWIJDyUMXkSuRnF6UltvzuoVZBzRmxM4wyri.Fl64BND3RtMYa9/6	\N	2025-11-05 14:31:13	2025-11-05 14:31:13
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hyper
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 68, true);


--
-- Name: alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hyper
--

SELECT pg_catalog.setval('public.alerts_id_seq', 37, true);


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hyper
--

SELECT pg_catalog.setval('public.branches_id_seq', 7, true);


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hyper
--

SELECT pg_catalog.setval('public.brands_id_seq', 6, true);


--
-- Name: devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hyper
--

SELECT pg_catalog.setval('public.devices_id_seq', 30, true);


--
-- Name: hardware_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hyper
--

SELECT pg_catalog.setval('public.hardware_details_id_seq', 49, true);


--
-- Name: hardware_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hyper
--

SELECT pg_catalog.setval('public.hardware_models_id_seq', 20, true);


--
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hyper
--

SELECT pg_catalog.setval('public.locations_id_seq', 13, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hyper
--

SELECT pg_catalog.setval('public.migrations_id_seq', 17, true);


--
-- Name: monitoring_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hyper
--

SELECT pg_catalog.setval('public.monitoring_history_id_seq', 14579, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hyper
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: branches branches_code_unique; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_code_unique UNIQUE (code);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: brands brands_name_unique; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_name_unique UNIQUE (name);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: devices devices_barcode_unique; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_barcode_unique UNIQUE (barcode);


--
-- Name: devices devices_ip_address_unique; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_ip_address_unique UNIQUE (ip_address);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: hardware_details hardware_details_pkey; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.hardware_details
    ADD CONSTRAINT hardware_details_pkey PRIMARY KEY (id);


--
-- Name: hardware_models hardware_models_brand_id_name_unique; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.hardware_models
    ADD CONSTRAINT hardware_models_brand_id_name_unique UNIQUE (brand_id, name);


--
-- Name: hardware_models hardware_models_pkey; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.hardware_models
    ADD CONSTRAINT hardware_models_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: monitoring_history monitoring_history_pkey; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.monitoring_history
    ADD CONSTRAINT monitoring_history_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: activity_logs_branch_id_created_at_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX activity_logs_branch_id_created_at_index ON public.activity_logs USING btree (branch_id, created_at);


--
-- Name: activity_logs_created_at_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX activity_logs_created_at_index ON public.activity_logs USING btree (created_at);


--
-- Name: activity_logs_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX activity_logs_entity_type_entity_id_index ON public.activity_logs USING btree (entity_type, entity_id);


--
-- Name: alerts_device_id_acknowledged_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX alerts_device_id_acknowledged_index ON public.alerts USING btree (device_id, acknowledged);


--
-- Name: alerts_status_severity_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX alerts_status_severity_index ON public.alerts USING btree (status, severity);


--
-- Name: alerts_triggered_at_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX alerts_triggered_at_index ON public.alerts USING btree (triggered_at);


--
-- Name: devices_branch_id_status_is_active_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX devices_branch_id_status_is_active_index ON public.devices USING btree (branch_id, status, is_active);


--
-- Name: devices_category_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX devices_category_index ON public.devices USING btree (category);


--
-- Name: hardware_details_brand_id_model_id_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX hardware_details_brand_id_model_id_index ON public.hardware_details USING btree (brand_id, model_id);


--
-- Name: locations_branch_id_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX locations_branch_id_index ON public.locations USING btree (branch_id);


--
-- Name: monitoring_history_device_id_checked_at_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX monitoring_history_device_id_checked_at_index ON public.monitoring_history USING btree (device_id, checked_at);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: hyper
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: activity_logs activity_logs_branch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_branch_id_foreign FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: alerts alerts_device_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_device_id_foreign FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: devices devices_branch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_branch_id_foreign FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: devices devices_hardware_detail_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_hardware_detail_id_foreign FOREIGN KEY (hardware_detail_id) REFERENCES public.hardware_details(id) ON DELETE SET NULL;


--
-- Name: devices devices_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: hardware_details hardware_details_brand_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.hardware_details
    ADD CONSTRAINT hardware_details_brand_id_foreign FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: hardware_details hardware_details_model_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.hardware_details
    ADD CONSTRAINT hardware_details_model_id_foreign FOREIGN KEY (model_id) REFERENCES public.hardware_models(id) ON DELETE SET NULL;


--
-- Name: hardware_models hardware_models_brand_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.hardware_models
    ADD CONSTRAINT hardware_models_brand_id_foreign FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;


--
-- Name: locations locations_branch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_branch_id_foreign FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: monitoring_history monitoring_history_device_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: hyper
--

ALTER TABLE ONLY public.monitoring_history
    ADD CONSTRAINT monitoring_history_device_id_foreign FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO hyper;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO hyper;


--
-- PostgreSQL database dump complete
--

\unrestrict fQ1EqCy4OMCQvKTr6sOkObj09ywq6zjnxsqIKzkVfDWpvMT9Dm0MEdJe9gEVOm2

