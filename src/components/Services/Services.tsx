import React from 'react'
import { IoCallOutline } from 'react-icons/io5'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { servicesList } from '../../lists/services.list'
import styles from './Services.module.scss'
import ServicesCard from './ServicesCard/ServicesCard'

const Services: React.FC = () => {
	return (
		<div className={styles.root}>
			<div className={styles.wrapper}>
				<div className={styles.content}>
					<div className={styles.left}>
						<p className={styles.text1}>BEST PRICES</p>
						<p className={styles.text2}>Extra Services</p>
						<p className={styles.text3}>
							Experience unparalleled comfort and convenience with our extra
							hotel services, designed to make your stay even more enjoyable and
							tailored to your needs.
						</p>
						<div className={styles.phone}>
							<div className={styles.phone__left}>
								<IoCallOutline
									className={styles.icon}
									size={64}
									color='#0d7377'
								/>
							</div>
							<div className={styles.phone__right}>
								<p>880 987 654 765</p>
								<span>For More Information</span>
							</div>
						</div>
					</div>
					<div className={styles.right}>
						<Swiper
							modules={[Autoplay]}
							loop={true}
							autoplay={{ delay: 3000, disableOnInteraction: false }}
							spaceBetween={20} 
							slidesPerView={1} 
							breakpoints={{
								1300: {
									slidesPerView: 2, 
									spaceBetween: 40, 
								},
							}}
							className={styles.swiper}
						>
							{servicesList.map((item, index) => (
								<SwiperSlide  key={index}>
									<ServicesCard item={item} />
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Services
