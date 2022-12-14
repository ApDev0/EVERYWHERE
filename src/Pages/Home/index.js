import React, { useState, useEffect } from "react";
import { ScrollView, ActivityIndicator } from 'react-native';

import {
    Container,
    SearchContainer,
    Input,
    SearchButton,
    Title,
    BannerButton,
    Banner,
    SlyderMovie
} from './styles';

import { Feather } from '@expo/vector-icons';

import Header from '../../components/Header';
import SliderItem from "../../components/SliderItem";

import { getListMovies, randomBanner } from '../../utils/movie';
import api, { key } from "../../services/api";
import { useNavigation } from '@react-navigation/native'


function Home() {


    const [nowMovies, setNowMovies] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [topMovies, setTopMovies] = useState([]);
    const [bannerMovie, setBannerMovie] = useState({});
    const [input, setInput] = useState('');

    const [loading, setLoading] = useState(true);

    const navigation = useNavigation();


    useEffect(() => {
        let isActive = true;
        const ac = new AbortController();

        async function getMovies() {
            const [nowData, popularData, topData] = await Promise.all([
                api.get('/movie/now_playing', {
                    params: { api_key: key, language: 'pt-PT', page: 1 },
                }),
                api.get('/movie/popular', {
                    params: { api_key: key, language: 'pt-PT', page: 1 },
                }),
                api.get('/movie/top_rated', {
                    params: { api_key: key, language: 'pt-PT', page: 1 },
                }),
            ]);

            if (isActive) {
                const nowList = getListMovies(10, nowData.data.results);
                const popularList = getListMovies(5, popularData.data.results);
                const topList = getListMovies(5, topData.data.results);

                setBannerMovie(nowData.data.results[randomBanner(nowData.data.results)])
                setNowMovies(nowList)
                setPopularMovies(popularList);
                setTopMovies(topList)
                setLoading(false);
            }

        }

        getMovies();

        return () => {
            isActive(false);
            ac.abort();
        }

    }, [])

    function navigateDetailsPage(item){
        navigation.navigate('Detail', {id: item.id})
    }

    function handleSearchMovie(){
        if(input === '') return;

        navigation.navigate('Search', {name: input})
        setInput('');
    }

    if (loading) {
        return (
            <Container>
                <ActivityIndicator size="large" color="#FF0000" />
            </Container>
        )
    }

    return (
        <Container>
            <Header title="EVERYWHERE" />

            <SearchContainer>
                <Input
                    placeholder="Ex: Os Vingadores"
                    placeholderTextColor="#ddd"
                    value={input}
                    onChangeText={(text) => setInput(text)}
                />
                <SearchButton onPress={ handleSearchMovie }>
                    <Feather name="search" size={30} color="#FFF" />
                </SearchButton>
            </SearchContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Title>Em cartaz</Title>
                <BannerButton activeOpacity={0.8} onPress={() => navigateDetailsPage(bannerMovie)} >
                    <Banner
                        resizeMethod="resize"
                        source={{ uri: `https://image.tmdb.org/t/p/original/${bannerMovie.poster_path}` }}
                    />
                </BannerButton>

                <SlyderMovie
                    horizontal={true}
                    showsHorizontalIndicator={false}
                    data={nowMovies}
                    renderItem={({ item }) => <SliderItem data={item}  navigatePage={ () => navigateDetailsPage(item)} />}
                    keyExtractor={(item) => String(item.id)}
                />

                <Title>Populares</Title>
                <SlyderMovie
                    horizontal={true}
                    showsHorizontalIndicator={false}
                    data={popularMovies}
                    renderItem={({ item }) => <SliderItem data={item} navigatePage={ () => navigateDetailsPage(item)} />}
                    keyExtractor={(item) => String(item.id)}
                />

                <Title>Mais Votados</Title>
                <SlyderMovie
                    horizontal={true}
                    showsHorizontalIndicator={false}
                    data={topMovies}
                    renderItem={({ item }) => <SliderItem data={item} navigatePage={ () => navigateDetailsPage(item)} />}
                    keyExtractor={(item) => String(item.id)}
                />

            </ScrollView>
        </Container>
    )
}

export default Home;