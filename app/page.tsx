import Hero from "@/components/Hero";
import FeaturedProduct from "@/components/FeaturedProduct";
import BlogSection from "@/components/BlogSection";
import AboutMe from "@/components/AboutMe";
import Courses from "@/components/Courses";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProduct />
      <BlogSection />
      <AboutMe />
      <Courses />
      <Projects />
    </>
  );
}
