DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- Tabelul studentilor
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 16 AND age <= 100)
);

-- Tabelul cursurilor
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    teacher VARCHAR(100) NOT NULL,
    max_students INTEGER NOT NULL CHECK (max_students > 0)
);

-- Tabelul inscrierilor (legatura dintre studenti si cursuri)
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    grade NUMERIC(4,2) CHECK (grade >= 1 AND grade <= 10),
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
    UNIQUE(student_id, course_id)
);
