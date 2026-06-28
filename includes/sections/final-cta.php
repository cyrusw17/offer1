<?php
$offer = config('offer');
$success = $formSuccess ?? false;
$errors = $formErrors ?? [];
$old = $formOld ?? [];
?>
<section class="section section-cta" id="book">
    <div class="cta-bg" aria-hidden="true"></div>
    <div class="container cta-grid reveal">
        <div class="cta-copy">
            <p class="eyebrow eyebrow-light">Final call</p>
            <h2 class="section-title light">
                <?= (int) $offer['spots_remaining'] ?>/<?= (int) $offer['spots_total'] ?> founding spots open
            </h2>
            <p class="section-lead light">
                When they're filled, pricing returns to
                <strong>$<?= number_format($offer['setup_normal']) ?> setup + $<?= $offer['monthly'] ?>/month</strong>.
                Book a free strategy call — we'll tell you honestly if we're the right fit.
            </p>
            <ul class="cta-checklist">
                <li><span class="check-icon check-icon--light" aria-hidden="true"></span> 30-minute call</li>
                <li><span class="check-icon check-icon--light" aria-hidden="true"></span> No pressure</li>
                <li><span class="check-icon check-icon--light" aria-hidden="true"></span> Walk away if it's not right</li>
            </ul>
            <?php if (config('calendly_url')): ?>
                <a href="<?= e(config('calendly_url')) ?>" class="btn btn-primary btn-lg" target="_blank" rel="noopener">Schedule on Calendly</a>
            <?php endif; ?>
        </div>

        <div class="form-panel" id="form">
            <h3>Book Your Free Strategy Call</h3>
            <p class="form-sub">Tell us about your business — we'll respond within 24 hours.</p>

            <?php if ($success): ?>
                <div class="alert success" role="status">
                    <strong>Message sent.</strong>
                    <p>We'll call or email within 24 hours to schedule your strategy session.</p>
                </div>
            <?php else: ?>

            <?php if (! empty($errors['_form'])): ?>
                <div class="alert error" role="alert"><?= e($errors['_form']) ?></div>
            <?php endif; ?>

            <form method="post" action="#form" novalidate>
                <input type="hidden" name="_token" value="<?= e($csrfToken ?? '') ?>">
                <input type="text" name="website" value="" tabindex="-1" autocomplete="off" class="hp-field" aria-hidden="true">
                <div class="field-row">
                    <div class="field">
                        <label for="name">Your name *</label>
                        <input type="text" id="name" name="name" value="<?= e($old['name'] ?? '') ?>" required autocomplete="name">
                        <?php if (! empty($errors['name'])): ?><span class="field-error"><?= e($errors['name']) ?></span><?php endif; ?>
                    </div>
                    <div class="field">
                        <label for="phone">Phone *</label>
                        <input type="tel" id="phone" name="phone" value="<?= e($old['phone'] ?? '') ?>" required autocomplete="tel" inputmode="tel">
                        <?php if (! empty($errors['phone'])): ?><span class="field-error"><?= e($errors['phone']) ?></span><?php endif; ?>
                    </div>
                </div>
                <div class="field">
                    <label for="business_name">Business name *</label>
                    <input type="text" id="business_name" name="business_name" value="<?= e($old['business_name'] ?? '') ?>" required>
                    <?php if (! empty($errors['business_name'])): ?><span class="field-error"><?= e($errors['business_name']) ?></span><?php endif; ?>
                </div>
                <div class="field-row">
                    <div class="field">
                        <label for="location">City, State *</label>
                        <input type="text" id="location" name="location" value="<?= e($old['location'] ?? '') ?>" required placeholder="Phoenix, AZ">
                        <?php if (! empty($errors['location'])): ?><span class="field-error"><?= e($errors['location']) ?></span><?php endif; ?>
                    </div>
                    <div class="field">
                        <label for="industry">Industry *</label>
                        <select id="industry" name="industry" required>
                            <option value="">Select…</option>
                            <?php foreach (config('form_industries') as $ind): ?>
                                <option value="<?= e($ind) ?>" <?= ($old['industry'] ?? '') === $ind ? 'selected' : '' ?>><?= e($ind) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <?php if (! empty($errors['industry'])): ?><span class="field-error"><?= e($errors['industry']) ?></span><?php endif; ?>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-block btn-lg">Request My Strategy Call</button>
                <p class="form-trust">No spam. No pressure. One reply within 24 hours.</p>
            </form>
            <?php endif; ?>
        </div>
    </div>
</section>
