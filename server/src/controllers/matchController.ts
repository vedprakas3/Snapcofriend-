import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import FriendProfile from '../models/FriendProfile';
import User from '../models/User';

// AI-powered matching algorithm
interface MatchScore {
  friendId: string;
  score: number;
  reasons: string[];
  package: any;
}

const calculateMatchScore = (
  friendProfile: any,
  situation: string,
  category: string,
  urgency: string,
  requirements: string[]
): MatchScore => {
  let score = 0;
  const reasons: string[] = [];
  let bestPackage = null;
  let bestPackageScore = 0;

  // Check for packages in the requested category
  const matchingPackages = friendProfile.presencePackages.filter(
    (p: any) => p.category === category && p.isActive
  );

  if (matchingPackages.length > 0) {
    score += 30;
    reasons.push(`Specializes in ${category} events`);

    // Find best matching package
    for (const pkg of matchingPackages) {
      let pkgScore = pkg.rating * 10;
      
      // Check if package requirements match situation
      const situationLower = situation.toLowerCase();
      const pkgKeywords = pkg.description.toLowerCase().split(' ');
      const matchCount = pkgKeywords.filter((kw: string) => 
        situationLower.includes(kw)
      ).length;
      pkgScore += matchCount * 5;

      if (pkgScore > bestPackageScore) {
        bestPackageScore = pkgScore;
        bestPackage = pkg;
      }
    }
  }

  // Rating bonus
  if (friendProfile.averageRating >= 4.5) {
    score += 20;
    reasons.push('Top-rated companion (4.5+)');
  } else if (friendProfile.averageRating >= 4.0) {
    score += 10;
    reasons.push('Highly rated');
  }

  // Verification bonus
  if (friendProfile.verificationStatus.idVerified) {
    score += 10;
    reasons.push('ID verified');
  }
  if (friendProfile.verificationStatus.backgroundChecked) {
    score += 10;
    reasons.push('Background checked');
  }
  if (friendProfile.verificationStatus.videoIntro) {
    score += 5;
    reasons.push('Video introduction available');
  }

  // Response rate bonus
  if (friendProfile.responseRate >= 90) {
    score += 10;
    reasons.push('Very responsive');
  }

  // Completion rate bonus
  if (friendProfile.completionRate >= 95) {
    score += 10;
    reasons.push('Excellent completion rate');
  }

  // Experience bonus
  if (friendProfile.totalBookings >= 10) {
    score += 10;
    reasons.push('Experienced companion');
  }

  // Urgency matching
  if (urgency === 'urgent' && friendProfile.isAvailableNow) {
    score += 15;
    reasons.push('Available now for urgent request');
  }

  // Check specialties against situation
  if (friendProfile.specialties) {
    for (const specialty of friendProfile.specialties) {
      if (situation.toLowerCase().includes(specialty.toLowerCase())) {
        score += 8;
        reasons.push(`Expert in ${specialty}`);
        break;
      }
    }
  }

  // Check skills against requirements
  if (requirements && friendProfile.skills) {
    const skillMatches = requirements.filter((req: string) =>
      friendProfile.skills.some((skill: string) =>
        skill.toLowerCase().includes(req.toLowerCase())
      )
    );
    score += skillMatches.length * 5;
    if (skillMatches.length > 0) {
      reasons.push(`Matches your specific requirements`);
    }
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return {
    friendId: friendProfile._id.toString(),
    score,
    reasons: reasons.slice(0, 4), // Top 4 reasons
    package: bestPackage
  };
};

// @desc    Find matches for a situation
// @route   POST /api/matches/find
// @access  Private
export const findMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const {
      situation,
      category,
      date,
      duration,
      location,
      budget,
      genderPreference,
      verifiedOnly,
      urgency = 'flexible',
      requirements = []
    } = req.body;

    // Build query
    const query: any = { isActive: true };

    if (verifiedOnly) {
      query['verificationStatus.idVerified'] = true;
    }

    // Geospatial query if coordinates provided
    let geoQuery = {};
    if (location.coordinates) {
      geoQuery = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: location.coordinates
            },
            $maxDistance: 50000 // 50km
          }
        }
      };
    }

    // Find friends with matching packages
    query['presencePackages.category'] = category;
    query['presencePackages.isActive'] = true;

    if (budget) {
      query['presencePackages.hourlyRate'] = {
        $gte: budget.min || 500,
        $lte: budget.max || 5000
      };
    }

    const friends = await FriendProfile.find({ ...query, ...geoQuery })
      .populate('userId', 'firstName lastName avatar gender rating reviewCount isVerified languages');

    // Calculate match scores
    const matches: MatchScore[] = friends.map((friend) =>
      calculateMatchScore(friend, situation, category, urgency, requirements)
    );

    // Sort by score and take top 3
    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, 3);

    // Get full friend details for top matches
    const matchDetails = await Promise.all(
      topMatches.map(async (match) => {
        const friend = friends.find((f) => f._id.toString() === match.friendId);
        return {
          friend,
          compatibility: match.score,
          reasons: match.reasons,
          recommendedPackage: match.package,
          estimatedTotal: match.package
            ? match.package.hourlyRate * duration
            : null
        };
      })
    );

    res.json({
      success: true,
      data: matchDetails,
      meta: {
        totalMatches: friends.length,
        situation: {
          category,
          urgency,
          parsedRequirements: requirements
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get match details for a specific friend
// @route   GET /api/matches/:friendId
// @access  Private
export const getMatchDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const friend = await FriendProfile.findById(req.params.friendId)
      .populate('userId', 'firstName lastName avatar rating reviewCount isVerified languages bio');

    if (!friend) {
      res.status(404).json({ message: 'Friend not found' });
      return;
    }

    // Get recent reviews
    const Booking = (await import('../models/Booking')).default;
    const recentBookings = await Booking.find({
      friendId: friend.userId._id,
      review: { $exists: true }
    })
      .select('review')
      .sort({ createdAt: -1 })
      .limit(5);

    const reviews = recentBookings.map((b) => b.review);

    res.json({
      success: true,
      data: {
        friend,
        reviews,
        stats: {
          totalBookings: friend.totalBookings,
          completionRate: friend.completionRate,
          responseRate: friend.responseRate,
          averageResponseTime: friend.responseTime
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended friends
// @route   GET /api/matches/recommendations
// @access  Private
export const getRecommendedFriends = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 6 } = req.query;

    // Get featured and highly-rated friends
    const friends = await FriendProfile.find({
      isActive: true,
      isFeatured: true
    })
      .populate('userId', 'firstName lastName avatar rating reviewCount')
      .limit(Number(limit));

    // If not enough featured, get top-rated
    if (friends.length < Number(limit)) {
      const additionalFriends = await FriendProfile.find({
        isActive: true,
        isFeatured: false,
        'verificationStatus.idVerified': true
      })
        .populate('userId', 'firstName lastName avatar rating reviewCount')
        .sort({ totalBookings: -1 })
        .limit(Number(limit) - friends.length);

      friends.push(...additionalFriends);
    }

    res.json({
      success: true,
      data: friends
    });
  } catch (error) {
    next(error);
  }
};
