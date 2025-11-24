import Hero from '../components/Home/Hero';
import FilterBar from '../components/Home/FilterBar';
import FeaturedCategories from '../components/Home/FeaturedCategories';
import ToolGrid from '../components/Home/ToolGrid';

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            <Hero />
            <FilterBar />
            <FeaturedCategories />
            <ToolGrid />
        </div>
    );
}
