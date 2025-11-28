import { communityPosts } from '@/data/communityPosts';
import CommunityFeedClient from './CommunityFeed.client';

export default function CommunityFeed() {
  return <CommunityFeedClient posts={communityPosts} />;
}
